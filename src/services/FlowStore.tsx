import * as axios from 'axios';
import {LocationProps, UIMetaDataProps, NodeProps, ExitProps, ActionProps, SendMessageProps} from '../interfaces'
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

export class FlowDefinition {
    nodes: NodeProps[]

    getNode(uuid: string): NodeProps {
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

    getAction(uuid: string): ActionProps {
        // TODO: make this less dump
        for (let node of this.nodes) {
            for (let action of node.actions) {
                if (action.uuid == uuid) {
                    return action;
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
        node._ui.location.x = location[0];
        node._ui.location.y = location[1];
    }

    updateAction(uuid: string, definition: string) {
        var props = JSON.parse(definition);
        for (let node of this.nodes) {
            for (let idx in node.actions) {
                var action = node.actions[idx];
                if (action.uuid == uuid) {
                    // (node.actions[idx] as SendMessageProps).text = props.text;
                    node.actions[idx] = props;
                    //node.actions[idx].type = props.type;
                }
            }
        }
    }
}

export class FlowStore {

    private static singleton: FlowStore = new FlowStore();

    private currentDefinition: FlowDefinition;

    static get(): FlowStore {
        return FlowStore.singleton;
    }

    private constructor() {
        console.log('init flow store');
    }

    loadFromUrl(url: string, onLoad: Function) {
        console.log(url);
        axios.default.get(url).then((response: axios.AxiosResponse) => {
            console.log('Fetched definition..');
            onLoad(eval(response.data) as FlowDefinition);
        });
    }

    loadFromStorage() {
        console.log('Loading from storage..');
        if (storage('flow')) {
            return storage.get('flow') as FlowDefinition;
        }
    }

    /**
     * Loads the current flow from storage or fetches if there isn't one yet
     * @param url the url to load from if no local flow is found
     */
    loadFlow(url: string, onLoad: Function, force: boolean) {
        if (storage('flow') && !force) {
            onLoad(this.loadFromStorage());
        } else {
            this.loadFromUrl(url, onLoad);
        }
    }
    
    save(definition: FlowDefinition) {
        console.log('Saving flow', definition);
        storage.set('flow', definition);
    }
}