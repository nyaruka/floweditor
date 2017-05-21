import axios from 'axios';
import {AxiosResponse} from 'axios';
import {LocationProps, UINode, FlowDefinition} from '../interfaces'

var storage = require('local-storage');

export class Location implements LocationProps {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class UINodeMetaData implements UINode {
    position: Location;
    
    constructor(location: Location) {
        this.position = location;
    }

    setLocation(x: number, y: number) {
        this.position.x = x;
        this.position.y = y;
    }
}


export class FlowStore {

    
    private static singleton: FlowStore = new FlowStore();
    
    static get(): FlowStore {
        return FlowStore.singleton;
    }

    private constructor() {
        // console.log('init flow store');
    }

    reset() {
        storage.remove("flow");
    }

    getFlowFromStore(uuid: string): FlowDefinition {
        var flow = storage.get("flow");
        if (flow != null) {
            return flow as FlowDefinition;
        } else {
            return {
                uuid: uuid, 
                nodes: [],
                localization: null,
                _ui: {
                    nodes: {}
                }
            }
        }
    }

    loadFromUrl(url: string, token: string, onLoad: Function) {
        return axios.get(url).then((response: AxiosResponse) => {
            var json = eval(response.data);
            let definition = json as FlowDefinition;
            onLoad(definition);
        });
    }

    save(definition: FlowDefinition) {
        console.log("Saving: ", definition);
        storage.set("flow", definition);
    }
}

export default FlowStore;           