// import * as axios from 'axios';
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
        console.log('init flow store');

    }

    fetchLegacyFlow(uuid: string, token?: string, reload?: boolean): Promise<FlowDefinition> {

        if (!token || !reload) {
            var existing = storage.get(uuid);
            if (existing) {
                // return Promise.resolve(existing as FlowDefinition);
                // returning asyn pisses off jsplumb
                return new Promise<FlowDefinition>((resolve,reject) => {
                    setTimeout(()=>{
                        resolve(existing as FlowDefinition);
                    }, 0);
                });
                
            }
        }
        
        var url = "/textit/definitions.json?flow="+ uuid;
        var headers = {
            Authorization: "Token " + token 
        }

        return new Promise<FlowDefinition>((resolve,reject) => {
            axios.get(url, {headers: headers}).then((response: AxiosResponse) => {
                console.log("Fetching old flow", url);
                var json = eval(response.data);
                if (json.version >= 10) {
                    console.log("Migrating", uuid);
                    axios.post("/migrate", {flows: json["flows"]}).then((response: AxiosResponse) => {

                        // write each one to our store
                        var requested: FlowDefinition;
                        for (let def of response.data) {
                            storage.set(def.uuid, def);
                            if (def.uuid == uuid) {
                                requested = def;
                            }
                        }

                        console.log("Migrated, resolving promise", requested);
                        resolve(requested);
                    });
                }
            });
        });
    }

    getFlowFromStore(uuid: string): FlowDefinition {
        return storage.get(uuid) as FlowDefinition;
    }

    loadFromUrl(url: string, token: string, onLoad: Function) {
        return axios.get(url).then((response: AxiosResponse) => {
            var json = eval(response.data);
            let definition = json as FlowDefinition;
            onLoad(definition);
        });
    }

    save(definition: FlowDefinition) {
        storage.set('flow', definition);
    }
}

export default FlowStore;           