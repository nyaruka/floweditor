import axios from 'axios';
import {AxiosResponse} from 'axios';
import {FlowDefinition} from '../interfaces';

export interface FlowDetails {
    uuid: string;
    name: string;
}

export class Temba {
    
    private site: string;
    private token: string;
    
    constructor(site: string, token: string) {
        this.site = site;
        this.token = token;
    }

    public getFlows(): Promise<FlowDetails[]> {
        
        var url = "/" + this.site + "/flows.json";
        var headers = {
            Authorization: "Token " + this.token
        }

        return new Promise<FlowDetails[]>((resolve,reject) => {
            axios.get(url, {headers: headers}).then((response: AxiosResponse) => {
                resolve(response.data.results as FlowDetails[])
            });
        });
    }

    public fetchLegacyFlows(uuid: string, ignoreDependencies = false): Promise<FlowDefinition[]> {

        var url = "/" + this.site + "/definitions.json?flow="+ uuid;
        var headers = {
            Authorization: "Token " + this.token
        }

        return new Promise<FlowDefinition[]>((resolve,reject) => {
            axios.get(url, {headers: headers}).then((response: AxiosResponse) => {
                console.log("Fetching old flow", url);
                var json = response.data
                if (json.version >= 10) {

                    var toMigrate: FlowDefinition[] = [];

                    if (ignoreDependencies) {
                        for (let def of response.data.flows) {
                            if (def.metadata.uuid == uuid) {
                                toMigrate.push(def);
                            }
                        }
                    } else {
                        toMigrate = response.data.flows as FlowDefinition[];
                    }

                    axios.post("/migrate", {flows: toMigrate}).then((response: AxiosResponse) => {
                        resolve(response.data as FlowDefinition[]);
                    });
                }
            });
        });
    }

}