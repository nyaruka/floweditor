import * as axios from 'axios';
import * as Interfaces from '../interfaces'
var storage = require('local-storage');

export class Location implements Interfaces.LocationProps {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class UINodeMetaData implements Interfaces.UINode {
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
    private currentDefinition: Interfaces.FlowDefinition;

    static get(): FlowStore {
        return FlowStore.singleton;
    }

    private constructor() {
        console.log('init flow store');
    }

    loadFromUrl(url: string, onLoad: Function) {
        console.log('Loading from url', url);
        return axios.default.get(url).then((response: axios.AxiosResponse) => {
            let definition = eval(response.data) as Interfaces.FlowDefinition
            console.log(definition);
            onLoad(definition);
        });
    }

    loadFromStorage() {
        console.log('Loading from storage..');
        if (storage('flow')) {
            return (storage.get('flow') as Interfaces.FlowDefinition);
        }
    }

    /**
     * Loads the current flow from storage or fetches if there isn't one yet
     * @param url the url to load from if no local flow is found
     */
    loadFlow(url: string, onLoad: Function, force: boolean) {
        if (storage('flow') && !force) {
            let definition = this.loadFromStorage()
            onLoad(definition);
        } else {
            return this.loadFromUrl(url, onLoad);
        }
    }
    
    save(definition: Interfaces.FlowDefinition) {
        storage.set('flow', definition);
        // console.log("Saving");
        // console.log(JSON.stringify(definition, null, 2));
    }
}

export default FlowStore;           