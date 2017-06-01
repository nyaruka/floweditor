import axios from 'axios';
import { AxiosResponse } from 'axios';
import { FlowDefinition } from '../FlowDefinition';

export interface FlowDetails {
    uuid: string;
    name: string;
}

/**
 * RapidPro API Accessor. Depends on goflow legacy migration.
 */
export class Temba {

    private site: string;
    private token: string;

    constructor(site: string, token: string) {
        this.site = site;
        this.token = token;
    }

    /**
     * Gets a list of flows for the account
     */
    public getFlows(): Promise<FlowDetails[]> {

        var url = "/" + this.site + "/flows.json";
        var headers = {
            Authorization: "Token " + this.token
        }

        return new Promise<FlowDetails[]>((resolve, reject) => {
            axios.get(url, { headers: headers }).then((response: AxiosResponse) => {
                resolve(response.data.results as FlowDetails[])
            });
        });
    }

    /**
     * Gets the given flow and it's dependencies and runs them through the goflow migration.
     * @param uuid the uuid to fetch
     * @param ignoreDependencies to fetch only the flow requested
     */
    public fetchLegacyFlows(uuid: string, ignoreDependencies: boolean = false): Promise<FlowDefinition[]> {

        var url = "/" + this.site + "/definitions.json?flow=" + uuid;
        var headers = {
            Authorization: "Token " + this.token
        }

        return new Promise<FlowDefinition[]>((resolve, reject) => {
            axios.get(url, { headers: headers }).then((response: AxiosResponse) => {
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

                    // console.log(toMigrate);
                    axios.post("/migrate", { flows: toMigrate }).then((response: AxiosResponse) => {
                        // console.log(response.data)
                        resolve(response.data as FlowDefinition[]);
                    });
                }
            });
        });
    }

}