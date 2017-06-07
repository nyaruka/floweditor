var lib = require('../../node_modules/jsplumb/dist/js/jsplumb.js');
import { FlowDefinition, Exit } from '../FlowDefinition';

export interface DragEvent {
    el: Element
    pos: number[]
    finalPos: number[]
    e: MouseEvent
    clientX: number
    clientY: number
    target: Element
}

export class Plumber {

    public jsPlumb: any;

    private static singleton: Plumber = new Plumber();

    // we batch up connections to apply them together
    private pendingConnections: { [id: string]: { source: string, target: string, className: string } } = {}
    private pendingConnectionTimeout: any;

    static get(): Plumber {
        return Plumber.singleton;
    }

    targetDefaults = {
        anchor: ["Continuous", { faces: ["left", "top", "right"] }],
        endpoint: ["Dot", { width: 10, height: 10, hoverClass: 'plumb-endpoint-hover' }],
        dropOptions: { tolerance: "touch", hoverClass: "plumb-drop-hover", isTarget: false },
        dragAllowedWhenFull: false,
        deleteEndpointsOnEmpty: true,
        isTarget: false
    }

    sourceDefaults = {
        anchor: "BottomCenter",
        maxConnections: 1,
        dragAllowedWhenFull: false,
        deleteEndpointsOnEmpty: true,
        isSource: true
    }

    private constructor() {
        this.jsPlumb = lib.jsPlumb.importDefaults({
            DragOptions: { cursor: 'pointer', zIndex: 1000 },
            DropOptions: { tolerance: "touch", hoverClass: "plumb-hover" },
            Endpoint: "Blank",
            EndpointStyle: { strokeStyle: "transparent" },
            PaintStyle: { strokeWidth: 5, stroke: "#98C0D9" },
            ConnectorHoverStyle: { stroke: "#27ae60" },
            ConnectorHoverClass: "plumb-connector-hover",
            ConnectionsDetachable: true,
            Connector: ["Flowchart", { stub: 12, midpoint: .85, alwaysRespectStubs: false, gap: [0, 7], cornerRadius: 2 }],
            ConnectionOverlays: [["PlainArrow", { location: .9999, width: 12, length: 12, foldback: 1 }]],
            Container: "flow-editor"
        });

        // if our browser resizes, make sure to repaint accordingly
        window.onresize = () => {
            this.jsPlumb.repaintEverything();
        }
    }

    debug(): any {
        return this.jsPlumb;
    }

    draggable(ele: JSX.Element, start: Function, drag: Function, stop: Function) {
        this.jsPlumb.draggable(ele, {
            start: (event: any) => start(event),
            drag: (event: DragEvent) => drag(event),
            stop: (event: DragEvent) => stop(event),
            containment: true
        })
    }

    makeSource(uuid: string) {
        this.jsPlumb.makeSource(uuid, this.sourceDefaults);
    }

    makeTarget(uuid: string) {
        this.jsPlumb.makeTarget(uuid, this.targetDefaults);
    }

    connectExit(exit: Exit, confirmDelete: boolean) {
        this.connect(exit.uuid, exit.destination_node_uuid, confirmDelete ? "confirm_delete" : null);
    }

    private handlePendingConnections() {
        var targets: { [id: string]: boolean } = {}
        this.jsPlumb.batch(() => {
            var batch = Object.keys(this.pendingConnections).length;
            if (batch > 1) {
                console.log("batching " + batch + " connections");
            }

            for (let key in this.pendingConnections) {
                var connection = this.pendingConnections[key];
                const { source, target, className } = connection;

                if (source != null) {
                    // any existing connections for our source need to be deleted
                    this.jsPlumb.select({ source: source }).delete({ fireEvent: false });

                    // now make our new connection
                    if (target != null) {

                        // don't allow manual detachments if our connection is styled
                        if (className) {
                            this.jsPlumb.connect({ source: source, target: target, fireEvent: false, cssClass: className, detachable: false });
                        } else {
                            this.jsPlumb.connect({ source: source, target: target, fireEvent: false, cssClass: className });
                        }
                    }
                }

                if (target != null) {
                    targets[target] = true;
                }

                delete this.pendingConnections[key];
            }
        });

        // revalidate the targets that we updated
        for (let target in targets) {
            this.revalidate(target);
        }
    }

    private checkForPendingConnections() {
        if (this.pendingConnectionTimeout) {
            window.clearTimeout(this.pendingConnectionTimeout);
        }

        this.pendingConnectionTimeout = window.setTimeout(() => {
            this.handlePendingConnections();
        }, 0);
    }

    connect(source: string, target: string, className: string = null) {
        this.pendingConnections[source + ":" + target + ":" + className] = { source, target, className };
        this.checkForPendingConnections();
    }

    bind(event: string, onEvent: Function) {
        return this.jsPlumb.bind(event, onEvent);
    }

    revalidate(uuid: string) {
        this.jsPlumb.revalidate(uuid);
        this.jsPlumb.repaint(uuid);
    }

    repaint(uuid?: string) {
        if (!uuid) {
            this.jsPlumb.recalculateOffsets();
            this.jsPlumb.repaintEverything();
        } else {
            this.jsPlumb.recalculateOffsets(uuid);
            this.jsPlumb.repaint(uuid);
        }
    }

    remove(uuid: string) {
        if (this.jsPlumb.isSource(uuid)) {
            this.jsPlumb.unmakeSource(uuid);
            this.jsPlumb.remove(uuid);
        } else if (this.jsPlumb.isTarget(uuid)) {
            this.jsPlumb.deleteConnectionsForElement(uuid);
        }
    }

    recalculate(uuid?: string) {
        this.jsPlumb.revalidate(uuid);
        if (uuid) {
            this.jsPlumb.recalculateOffsets(uuid);
        } else {
            this.jsPlumb.recalculateOffsets();
        }
        this.jsPlumb.repaint(uuid);
    }

    reset() {
        this.jsPlumb.reset();
    }
}

export default Plumber;