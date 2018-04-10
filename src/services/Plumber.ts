// TODO: Remove use of Function
// tslint:disable:ban-types
const { jsPlumb: { importDefaults } } = require('../../node_modules/jsplumb/dist/js/jsplumb');
import { FlowNode, FlowDefinition, Exit, LocalizationMap } from '../flowTypes';

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
    [id: string]: { source: string; target: string; className: string };
}

export const REPAINT_DURATION = 600;
export const TARGET_DEFAULTS = {
    anchor: ['Continuous', { shape: 'Rectangle', faces: ['left', 'top', 'right'] }],
    endpoint: [
        'Dot',
        { radius: 13, cssClass: 'plumb-endpoint', hoverClass: 'plumb-endpoint-hover' }
    ],
    dropOptions: { tolerance: 'touch', hoverClass: 'plumb-drop-hover', isTarget: false },
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

export default class Plumber {
    public jsPlumb: any;

    // we batch up connections to apply them together
    private pendingConnections: PendingConnections = {};
    private pendingConnectionTimeout: any;

    private animateInterval: any = null;

    constructor() {
        this.jsPlumb = importDefaults({
            DragOptions: { cursor: 'pointer', zIndex: 1000 },
            DropOptions: { tolerance: 'touch', hoverClass: 'plumb-hover' },
            Endpoint: 'Blank',
            EndpointStyle: { strokeStyle: 'transparent' },
            PaintStyle: { strokeWidth: 1, outlineWidth: 1, outlineStroke: '#fff' },
            ConnectorHoverStyle: { stroke: '#27ae60' },
            ConnectorHoverClass: 'plumb-connector-hover',
            ConnectionsDetachable: true,
            Connector: [
                'Flowchart',
                {
                    stub: 12,
                    midpoint: 0.55,
                    alwaysRespectStubs: true,
                    gap: [0, 0],
                    cornerRadius: 5
                }
            ],
            ConnectionOverlays: [
                [
                    'PlainArrow',
                    { location: 0.9999, width: 8, length: 8, foldback: 1, cssClass: 'jtk-arrow' }
                ]
            ],
            Container: 'editor-container'
        });

        this.debug = this.debug.bind(this);
        this.draggable = this.draggable.bind(this);
        this.setSourceEnabled = this.setSourceEnabled.bind(this);
        this.makeSource = this.makeSource.bind(this);
        this.makeTarget = this.makeTarget.bind(this);
        this.connectExit = this.connectExit.bind(this);
        this.setDragSelection = this.setDragSelection.bind(this);
        this.clearDragSelection = this.clearDragSelection.bind(this);
        this.removeFromDragSelection = this.removeFromDragSelection.bind(this);
        this.cancelDurationRepaint = this.cancelDurationRepaint.bind(this);
        this.remove = this.remove.bind(this);
        this.repaintForDuration = this.repaintForDuration.bind(this);
        this.repaintFor = this.repaintFor.bind(this);
        this.handlePendingConnections = this.handlePendingConnections.bind(this);
        this.checkForPendingConnections = this.checkForPendingConnections.bind(this);
        this.connect = this.connect.bind(this);
        this.bind = this.bind.bind(this);
        this.repaint = this.repaint.bind(this);
        this.recalculate = this.recalculate.bind(this);
        this.reset = this.reset.bind(this);

        // if our browser resizes, make sure to repaint accordingly
        window.onresize = () => this.jsPlumb.repaintEverything();
    }

    public debug(): any {
        return this.jsPlumb;
    }

    public draggable(
        uuid: string,
        start: Function,
        drag: Function,
        stop: Function,
        beforeDrag: Function
    ): void {
        this.jsPlumb.draggable(uuid, {
            // over: (event: any) => { console.log("Over", event) },
            // beforeStart: (event: any) => { console.log("beforeStart"); },
            start: (event: DragEvent) => start(event),
            drag: (event: DragEvent) => drag(event),
            stop: (event: DragEvent) => stop(event),
            canDrag: () => {
                return beforeDrag();
            },
            containment: false,
            consumeFilteredEvents: false,
            consumeStartEvent: false
        });
    }

    public setSourceEnabled(uuid: string, enabled: boolean): void {
        this.jsPlumb.setSourceEnabled(uuid, enabled);
    }

    public makeSource(uuid: string): void {
        this.jsPlumb.makeSource(uuid, SOURCE_DEFAULTS);
    }

    public makeTarget(uuid: string): void {
        this.jsPlumb.makeTarget(uuid, TARGET_DEFAULTS);
    }

    public connectExit(node: FlowNode, exit: Exit, className: string = null): void {
        this.connect(`${node.uuid}:${exit.uuid}`, exit.destination_node_uuid, className);
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

    public repaintForDuration(duration: number = REPAINT_DURATION): void {
        console.log('repainting..');
        this.cancelDurationRepaint();
        const pause = 10;
        const newDuration = duration / pause;

        let cycles = 0;
        this.animateInterval = window.setInterval(() => {
            // TODO: optimize this to paint as little as possible
            // this.revalidate(uuid);
            this.jsPlumb.repaintEverything();

            if (cycles++ > newDuration) {
                window.clearInterval(this.animateInterval);
            }
        }, pause);
    }

    public repaintFor(millis: number): void {
        window.setInterval(() => {
            this.jsPlumb.repaintEverything();
        }, 1);
    }

    private handlePendingConnections(): void {
        const targets: { [id: string]: boolean } = {};
        this.jsPlumb.batch(() => {
            const batch = Object.keys(this.pendingConnections).length;
            if (batch > 1) {
                console.log('batching ' + batch + ' connections');
            }

            for (const key in this.pendingConnections) {
                if (this.pendingConnections.hasOwnProperty(key)) {
                    const connection = this.pendingConnections[key];
                    const { source, target, className } = connection;

                    if (source != null) {
                        // any existing connections for our source need to be deleted
                        this.jsPlumb.select({ source }).delete({ fireEvent: false });

                        // now make our new connection
                        if (target != null) {
                            // don't allow manual detachments if our connection is styled
                            if (className) {
                                this.jsPlumb.connect({
                                    source,
                                    target,
                                    fireEvent: false,
                                    cssClass: className,
                                    detachable: false
                                });
                            } else {
                                this.jsPlumb.connect({
                                    source,
                                    target,
                                    fireEvent: false,
                                    cssClass: className
                                });
                            }
                        }
                    }

                    if (target != null) {
                        targets[target] = true;
                    }

                    delete this.pendingConnections[key];
                }
            }
        });

        // revalidate the targets that we updated
        for (const target in targets) {
            if (targets.hasOwnProperty('target')) {
                this.recalculate(target);
            }
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

    public connect(source: string, target: string, className: string = null): void {
        this.pendingConnections[`${source}:${target}:${className}`] = {
            source,
            target,
            className
        };
        this.checkForPendingConnections();
    }

    public bind(event: string, onEvent: Function): void {
        return this.jsPlumb.bind(event, onEvent);
    }

    public repaint(uuid?: string): void {
        console.log('repaint');
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

    public recalculate(uuid?: string): void {
        window.setTimeout(() => {
            this.jsPlumb.revalidate(uuid);
            if (uuid) {
                this.jsPlumb.recalculateOffsets(uuid);
            } else {
                this.jsPlumb.recalculateOffsets();
            }
            this.jsPlumb.repaint(uuid);
        }, 0);
    }

    public reset(): void {
        // console.log("resetting plumbing");
        this.jsPlumb.reset();
    }
}
