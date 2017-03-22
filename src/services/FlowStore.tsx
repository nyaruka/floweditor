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

export class UIMetaData implements Interfaces.UIMetaDataProps {
    location: Location;
    
    constructor(location: Location) {
        this.location = location;
    }

    setLocation(x: number, y: number) {
        this.location.x = x;
        this.location.y = y;
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
            console.log('Fetched definition..');
            onLoad(eval(response.data) as Interfaces.FlowDefinition);
        });
    }

    loadFromStorage() {
        console.log('Loading from storage..');
        if (storage('flow')) {
            return storage.get('flow') as Interfaces.FlowDefinition;
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
            return this.loadFromUrl(url, onLoad);
        }
    }
    
    save(definition: Interfaces.FlowDefinition) {
        console.log('Saving flow', definition);
        storage.set('flow', definition);
    }
}

export default FlowStore;