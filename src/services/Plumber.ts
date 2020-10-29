import { Exit, FlowNode } from 'flowTypes';
import { GRID_SIZE, timeStart, timeEnd, debounce } from 'utils';

// TODO: Remove use of Function
// tslint:disable:ban-types
const {
  jsPlumb: { importDefaults }
} = require('../../node_modules/jsplumb/dist/js/jsplumb');
export interface DragEvent {
  el: Element;
  pos: number[];
  finalPos: number[];
  e: MouseEvent;
  clientX: number;
  clientY: number;
  target: Element;
}

export interface PendingConnections {
  [id: string]: {
    source: string;
    target: string;
    className: string;
    slot: number;
    totalSlots: number;
  };
}

export const REPAINT_DURATION = 600;

export const TARGET_DEFAULTS = {
  anchor: ['Continuous', { shape: 'Rectangle', faces: ['top', 'left', 'right'] }],
  endpoint: [
    'Rectangle',
    {
      width: 23,
      height: 23,
      cssClass: 'plumb-endpoint',
      hoverClass: 'plumb-endpoint-hover'
    }
  ],
  dropOptions: {
    tolerance: 'touch',
    hoverClass: 'plumb-drop-hover',
    isTarget: false
  },
  dragAllowedWhenFull: false,
  deleteEndpointsOnEmpty: true,
  isTarget: false
};

export const SOURCE_DEFAULTS = {
  anchor: 'BottomCenter',
  maxConnections: 1,
  dragAllowedWhenFull: false,
  deleteEndpointsOnEmpty: true,
  isSource: true
};

export const getAnchor = (sourceEle: any, targetEle: any): any[] => {
  return [
    'Continuous',
    {
      shape: 'Dot',
      faces:
        sourceEle.getBoundingClientRect().bottom + GRID_SIZE / 3 <
        targetEle.getBoundingClientRect().top
          ? ['top']
          : ['right', 'left']
    }
  ];
};

const defaultConnector = [
  'Flowchart',
  {
    stub: 12,
    midpoint: 0.75,
    alwaysRespectStubs: false,
    gap: [0, 5],
    cornerRadius: 3
  }
];

/* istanbul ignore next */
export default class Plumber {
  public jsPlumb: any;

  // we batch up connections to apply them together
  private pendingConnections: PendingConnections = {};
  private pendingConnectionTimeout: any;

  private animateInterval: any = null;

  private onLoadFunction: () => void = null;

  constructor() {
    this.jsPlumb = importDefaults({
      DragOptions: { cursor: 'pointer', zIndex: 1000 },
      DropOptions: { tolerance: 'touch', hoverClass: 'plumb-hover' },
      Endpoint: 'Rectangle',
      EndpointStyle: { strokeStyle: 'transparent' },
      PaintStyle: { strokeWidth: 3.5 },
      ConnectionsDetachable: true,
      Connector: defaultConnector,
      ConnectionOverlays: [
        [
          'PlainArrow',
          {
            location: 0.999,
            width: 12,
            length: 12,
            cssClass: 'jtk-arrow'
          }
        ]
      ]
    });

    this.debug = this.debug.bind(this);
    this.setSourceEnabled = this.setSourceEnabled.bind(this);
    this.makeSource = this.makeSource.bind(this);
    this.makeTarget = this.makeTarget.bind(this);
    this.connectExit = this.connectExit.bind(this);
    this.setDragSelection = this.setDragSelection.bind(this);
    this.clearDragSelection = this.clearDragSelection.bind(this);
    this.removeFromDragSelection = this.removeFromDragSelection.bind(this);
    this.cancelDurationRepaint = this.cancelDurationRepaint.bind(this);
    this.remove = this.remove.bind(this);
    this.handlePendingConnections = this.handlePendingConnections.bind(this);
    this.checkForPendingConnections = this.checkForPendingConnections.bind(this);
    this.connect = this.connect.bind(this);
    this.bind = this.bind.bind(this);
    this.repaint = this.repaint.bind(this);
    this.recalculate = this.recalculate.bind(this);
    this.reset = this.reset.bind(this);
    this.updateClass = this.updateClass.bind(this);
    this.rerouteAnchors = this.rerouteAnchors.bind(this);
  }

  public setContainer(containerId: string) {
    this.jsPlumb.setContainer(containerId);
  }

  public debug(): any {
    return this.jsPlumb;
  }

  public setSourceEnabled(uuid: string, enabled: boolean): void {
    this.jsPlumb.setSourceEnabled(uuid, enabled);
  }

  public makeSource(uuid: string): any {
    return this.jsPlumb.makeSource(uuid, SOURCE_DEFAULTS);
  }

  public makeTarget(uuid: string): void {
    this.jsPlumb.makeTarget(uuid, TARGET_DEFAULTS);
  }

  public connectExit(node: FlowNode, exit: Exit, className: string = null): void {
    this.connect(
      `${node.uuid}:${exit.uuid}`,
      exit.destination_uuid,
      className,
      node.exits.findIndex((e: Exit) => e.uuid === exit.uuid),
      node.exits.length
    );
  }

  public updateClass(node: FlowNode, exit: Exit, className: string, add: boolean): void {
    const source = `${node.uuid}:${exit.uuid}`;
    const connection = this.jsPlumb.select({ source });
    if (add) {
      connection.addClass(className);
    } else {
      connection.removeClass(className);
    }
  }

  public removeFromDragSelection(uuid: string): void {
    this.jsPlumb.removeFromDragSelection(uuid);
  }

  public setDragSelection(selected: { [uuid: string]: boolean }): void {
    this.cancelDurationRepaint();
    this.jsPlumb.clearDragSelection();

    Object.keys(selected).forEach(uuid => this.jsPlumb.addToDragSelection(uuid));
  }

  public clearDragSelection(): void {
    this.jsPlumb.clearDragSelection();
  }

  public cancelDurationRepaint(): void {
    if (this.animateInterval) {
      window.clearInterval(this.animateInterval);
      this.animateInterval = null;
    }
  }

  private handlePendingConnections(): void {
    const targets: { [id: string]: boolean } = {};

    const batch = Object.keys(this.pendingConnections).length;
    if (batch > 1) {
      timeStart('Batched ' + batch + ' connections');
    }

    this.jsPlumb.batch(() => {
      for (const key in this.pendingConnections) {
        if (this.pendingConnections.hasOwnProperty(key)) {
          const connection = this.pendingConnections[key];
          const { source, target, className, slot, totalSlots } = connection;

          const anchors = target
            ? [
                'Bottom',
                getAnchor(document.getElementById(source), document.getElementById(target))
              ]
            : [];

          if (source != null) {
            // any existing connections for our source need to be deleted
            this.jsPlumb.select({ source }).delete({ fireEvent: false });

            const start = totalSlots < 5 ? 0.75 : 0.35;
            let midpoint = start + slot * 0.15;
            const exitMiddle = totalSlots / 2;
            if (slot > exitMiddle) {
              midpoint = start - 0.05 + (totalSlots - slot) * 0.15;
            }

            // add reasonable boundaries for midpoints
            midpoint = Math.max(Math.min(0.9, midpoint), 0.1);

            const connector: any = [...defaultConnector];
            connector[1].midpoint = midpoint;

            // now make our new connection
            if (target != null) {
              this.jsPlumb.connect({
                source,
                target,
                anchors,
                fireEvent: false,
                cssClass: className,
                detachable: !className,
                connector
              });
            }
          }

          if (target != null) {
            targets[target] = true;
          }

          delete this.pendingConnections[key];
        }
      }
    }, false);

    if (batch > 1) {
      timeEnd('Batched ' + batch + ' connections');
    }

    // fire our callback for who is embedding us
    if (this.onLoadFunction) {
      this.onLoadFunction();
      this.onLoadFunction = null;
    }
  }

  public triggerLoaded(onLoad: () => void): void {
    if (onLoad) {
      if (Object.keys(this.pendingConnections).length === 0) {
        onLoad();
      }
      this.onLoadFunction = onLoad;
    }
  }

  private checkForPendingConnections(): void {
    if (this.pendingConnectionTimeout) {
      window.clearTimeout(this.pendingConnectionTimeout);
    }

    this.pendingConnectionTimeout = window.setTimeout(() => {
      this.handlePendingConnections();
    }, 0);
  }

  public connect(
    source: string,
    target: string,
    className: string = null,
    slot: number = 0,
    totalSlots: number = 0
  ): void {
    this.pendingConnections[`${source}:${target}:${className}`] = {
      source,
      target,
      className,
      slot,
      totalSlots
    };
    this.checkForPendingConnections();
  }

  public bind(event: string, onEvent: Function): void {
    return this.jsPlumb.bind(event, onEvent);
  }

  public repaint(uuid?: string): void {
    if (!uuid) {
      this.jsPlumb.recalculateOffsets();
      this.jsPlumb.repaintEverything();
    } else {
      this.jsPlumb.recalculateOffsets(uuid);
      this.jsPlumb.repaint(uuid);
    }
  }

  public remove(uuid: string): void {
    if (this.jsPlumb.isSource(uuid)) {
      this.jsPlumb.unmakeSource(uuid);
      this.jsPlumb.remove(uuid);
    } else if (this.jsPlumb.isTarget(uuid)) {
      this.jsPlumb.deleteConnectionsForElement(uuid);
    }
  }

  /**
   *
   * Reroutes the connections for actively moving nodes. We try to direct
   * connections as much as possible.
   * @param elements the targets and sources that ar moving around
   */
  public rerouteAnchors(elements: Element[]): void {
    elements.forEach((ele: Element) => {
      const uuid = ele.id;
      const connections = this.jsPlumb
        .getConnections({ target: uuid })
        .concat(this.jsPlumb.getConnections({ source: uuid }));
      for (const c of connections) {
        c.endpoints[1].setAnchor(getAnchor(c.endpoints[0].element, c.endpoints[1].element));
      }
    });
  }

  public revalidate(elements: Element[]): void {
    this.jsPlumb.revalidate(elements);

    // reroute our anchors but only after we stop moving for a bit
    debounce(this.rerouteAnchors, 200, () => {
      this.rerouteAnchors(elements);
    });
  }

  public recalculate(uuid: string): void {
    window.setTimeout(() => {
      this.jsPlumb.revalidate(uuid);
    }, 100);
  }

  public reset(): void {
    this.jsPlumb.reset();
  }

  public getPlumb(): any {
    return this.jsPlumb;
  }
}
