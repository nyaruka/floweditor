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

    static get(): Plumber {
        return Plumber.singleton;
    }

    targetDefaults = {
        anchor: ["Continuous", { faces: ["top", "left", "right"] }],
        endpoint: ["Rectangle", { width: 20, height: 20, hoverClass: 'plumb-endpoint-hover' }],
        dropOptions: { tolerance: "touch", hoverClass: "plumb-drop-hover" },
        dragAllowedWhenFull: false,
        deleteEndpointsOnDetach: true,
        deleteEndpointsOnEmpty: true,
        isTarget: true,
    }

    sourceDefaults = {
        anchor: "BottomCenter",
        maxConnections: 1,
        dragAllowedWhenFull: false,
        deleteEndpointsOnDetach: true,
        deleteEndpointsOnEmpty: true,
        isSource: true,
        paintStyle: { fillStyle: "blue", outlineColor: "black", outlineWidth: 1 }
    }

    private constructor() {
        this.jsPlumb = lib.jsPlumb.importDefaults({
            DragOptions: { cursor: 'pointer', zIndex: 1000 },
            DropOptions: { tolerance: "touch", hoverClass: "plumb-hover" },
            Endpoint: "Blank",
            EndpointStyle: { strokeStyle: "transparent" },
            PaintStyle: { strokeWidth: 5, stroke: "#98C0D9" },
            HoverPaintStyle: { strokeStyle: "#27ae60" },
            HoverClass: "connector-hover",
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

    connectNewNode(source: string, target: string) {
        this.connect(source, target);
        this.recalculate(target);
        this.repaint();
    }

    connectExit(exit: Exit) {
        this.connect(exit.uuid, exit.destination_node_uuid);
    }

    connect(source: string, target: string) {

        // already connected
        if (this.jsPlumb.select({ source: source, target: target }).length == 1) {
            return;
        }

        if (source != null && target != null) {

            // any existing connections for our source need to be deleted
            this.jsPlumb.select({ source: source }).delete({ fireEvent: false });

            // now make our new connection
            return this.jsPlumb.connect({ source: source, target: target, fireEvent: false });
        }
    }

    bind(event: string, onEvent: Function) {
        return this.jsPlumb.bind(event, onEvent);
    }

    revalidate(uuid: string) {
        this.jsPlumb.revalidate(uuid);
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
            // this.jsPlumb.removeConnections(uuid);
        }

        // this.jsPlumb.remove(uuid);
        // console.log(this.jsPlumb.select({source: uuid}));
        // console.log(this.jsPlumb.select({source: uuid}).delete());
        // this.jsPlumb.select({target: uuid}).delete();
    }

    removeEndpoint(endpoint: any) {
        this.jsPlumb.deleteEndpoint(endpoint.id);
    }

    recalculate(uuid?: string) {
        if (uuid) {
            this.jsPlumb.recalculateOffsets(uuid);
        } else {
            this.jsPlumb.recalculateOffsets();
        }
        window.setTimeout(() => {
            this.jsPlumb.repaint(uuid);
        }, 0)
    }

    reset() {
        this.jsPlumb.reset();
    }

    connectAll(flow: FlowDefinition): Promise<boolean> {
        return new Promise<any>((resolve) => {
            // console.log('Reconnecting plumbing..');
            // this will suspend drawing until all nodes are connected
            this.jsPlumb.ready(() => {
                this.jsPlumb.batch(() => {
                    this.jsPlumb.deleteEveryConnection();
                    // wire everything up
                    for (let node of flow.nodes) {
                        if (node.exits) {
                            for (let exit of node.exits) {
                                this.connect(exit.uuid, exit.destination_node_uuid);
                            }
                        }
                    }
                    resolve(true);
                });
            });
        });
    }
}

export default Plumber;