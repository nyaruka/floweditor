import * as axios from 'axios';
import {LocationProps, UIMetaDataProps, NodeProps, ExitProps, ActionProps} from '../interfaces'
var storage = require('local-storage');

export class Location implements LocationProps {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class UIMetaData implements UIMetaDataProps {
    location: Location;
    
    constructor(location: Location) {
        this.location = location;
    }

    setLocation(x: number, y: number) {
        this.location.x = x;
        this.location.y = y;
    }
}

export class Node implements NodeProps {
    uuid: string;
    exits: ExitProps[];
    actions: ActionProps[];
    router: any;
    _ui: UIMetaData;

    constructor(node: Node) {
        this.uuid = node.uuid;
        this.exits = node.exits;
        this.actions = node.actions;
        this.router = node.router;

        // initialize our uimd if we don't have it yet
        if (!node._ui){
            node._ui = new UIMetaData(new Location(0,0));
        } else {
            node._ui = new UIMetaData(node._ui.location)
        }

        this._ui = node._ui;
    }
}

export class FlowDefinition {
    nodes: Node[]

    constructor(definition: FlowDefinition) {
        this.nodes = []
        for (let node of definition.nodes) {
            this.nodes.push(new Node(node));
        }
    }

    getNode(uuid: string): Node {
        for (let node of this.nodes) {
            if (node.uuid == uuid) {
                return node
            }
        }
        return null;
    }

    getExit(uuid: string): ExitProps {
        // TODO: make this less dumb
        for (let node of this.nodes) {
            for (let exit of node.exits) {
                if (exit.uuid == uuid) {
                    return exit;
                }
            }
        }
    }

    updateDestination(exit: string, node: string) {
        console.log('Rerouting', exit, node);
        this.getExit(exit).destination = node;
    }

    updateLocation(uuid: string, location: number[]) {
        var node = this.getNode(uuid);
        node._ui.location.x = location[0]
        node._ui.location.y = location[1]
    }
}

export class FlowStore {
    private static singleton: FlowStore = new FlowStore();

    private currentDefinition: FlowDefinition;

    static get(): FlowStore {
        return FlowStore.singleton;
    }

    addDefinition(props: FlowDefinition) {
        this.currentDefinition = new FlowDefinition(props);
    }

    getCurrentDefinition(): FlowDefinition {
        return this.currentDefinition;
    }

    loadFromUrl(url: string, onLoad: Function) {
        console.log(url);
        axios.default.get(url).then((response: axios.AxiosResponse) => {
            console.log('Fetched definition..')
            this.addDefinition(eval(response.data) as FlowDefinition);
            onLoad();
        });
    }

    loadFromStorage() {
        console.log('Loading from storage..');
        if (storage('flow')) {
            var saved = storage.get('flow') as FlowDefinition;
            this.addDefinition(saved);
        }
    }

    /**
     * Loads the current flow from storage or fetches if there isn't one yet
     * @param url the url to load from if no local flow is found
     */
    loadFlow(url: string, onLoad: Function) {
        if (storage('flow')) {
            this.loadFromStorage();
            onLoad();
        } else {
            this.loadFromUrl(url, onLoad);
        }
    }
    
    markDirty() {
        this.save();
    }

    save() {
        console.log('Saving flow..');
        storage.set('flow', this.getCurrentDefinition());
    }
}