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
    
    private contactFields: Interfaces.SearchResult[];
    private groups: Interfaces.SearchResult[];

    static get(): FlowStore {
        return FlowStore.singleton;
    }

    private constructor() {
        console.log('init flow store');
    }

    public getContactFields() {
        return this.contactFields;
    }

    loadFromUrl(url: string, onLoad: Function) {
        console.log('Loading from url', url);
        return axios.default.get(url).then((response: axios.AxiosResponse) => {
            let definition = eval(response.data) as Interfaces.FlowDefinition
            this.initializeFlow(definition);
            onLoad(definition);
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
            let definition = this.loadFromStorage()
            this.initializeFlow(definition);
            onLoad(definition);
        } else {
            return this.loadFromUrl(url, onLoad);
        }
    }
    
    save(definition: Interfaces.FlowDefinition) {
        storage.set('flow', definition);
    }

    public getGroups() {
        return this.groups;
    }

    private initializeFlow(flow: Interfaces.FlowDefinition) {
        // find out what contact fields, contacts, and groups we have in our definition
        var fields: {[id:string]:Interfaces.SearchResult} = {}
        var groups: {[id:string]:Interfaces.Group} = {}

        for (let node of flow.nodes) {
            if (node.actions) {
                for (let action of node.actions) {
                    if (action.type == 'save_to_contact') {
                        var saveProps = action as Interfaces.SaveToContactProps;
                        if (!(saveProps.field in fields)) {
                            fields[saveProps.field] = { id: saveProps.field, name: saveProps.name, type: "field" }
                        }
                    } else if (action.type == 'add_group') {
                        var addGroupProps = action as Interfaces.AddToGroupProps;
                        if (!(addGroupProps.uuid in groups)) {
                            groups[addGroupProps.uuid] = { uuid: addGroupProps.uuid, name: addGroupProps.name}
                        }
                    }
                }
            }
        }

        this.contactFields = []
        for (var key in fields) {
            this.contactFields.push(fields[key]);
        }
    }
}

export default FlowStore;