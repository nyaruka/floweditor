import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Endpoints } from '../services/Config';
import { FlowDefinition, StartFlow } from '../FlowDefinition';
import { Activity } from "./ActivityManager";

export interface FlowDetails {
    uuid: string;
    name: string;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
}

/**
 * Exgternal API Accessor.
 */
export class External {

    private endpoints: Endpoints;
    private headers: any;

    constructor(endpoints: Endpoints, headers: any = {}) {
        this.endpoints = endpoints;
        this.headers = headers;
    }

    private getRequestOptions(): any {
        if (this.headers) {
            return { headers: this.headers }
        } else {
            return {};
        }
    }

    /**
     * Gets the path activity and the count of active particpants at each node
     */
    public getActivity(flowUUID: string): Promise<Activity> {
        return new Promise<Activity>((resolve, reject) => {
            if (this.endpoints.activity) {
                axios.get(this.endpoints.activity + "?flow=" + flowUUID, { headers: this.headers }).then((response: AxiosResponse) => {
                    resolve(response.data as Activity);
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject();
            }
        });
    }

    /**
     * Gets a list of all flows
     * TODO: filter by flow name
     */
    public getFlows(): Promise<FlowDetails[]> {
        return new Promise<FlowDetails[]>((resolve, reject) => {
            axios.get(this.endpoints.flows, { headers: this.headers }).then((response: AxiosResponse) => {
                resolve(response.data.results as FlowDetails[])
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Gets a flow definition for a given flow uuid
     */
    public getFlow(uuid: string, dependencies: boolean): Promise<FlowDetails> {
        // console.log("Getting flow:", uuid, this.endpoints.flows + "?uuid=" + uuid);
        return new Promise<FlowDetails>((resolve, reject) => {
            axios.get(this.endpoints.flows + "?uuid=" + uuid + "&dependencies=" + dependencies, this.getRequestOptions()).then((response: AxiosResponse) => {

                var details: FlowDetails = {
                    uuid: uuid,
                    name: null,
                    definition: null,
                    dependencies: []
                }

                var definition: FlowDefinition = null;
                var dependencies: FlowDefinition[] = [];
                var flowDetails = response.data.results as FlowDetails[];

                for (let flowDetail of flowDetails) {
                    if (!flowDetail.definition.uuid) {
                        flowDetail.definition.uuid = flowDetail.uuid;
                    }

                    this.initialize(flowDetail.definition);
                    if (flowDetail.uuid == uuid) {
                        details.definition = flowDetail.definition;
                        details.name = flowDetail.name;
                    } else {
                        details.dependencies.push(flowDetail.definition);
                    }
                }

                resolve(details);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * Save our flow definition on our external server
     * @param definition the definition to update
     */
    public saveFlow(definition: FlowDefinition): Promise<FlowDefinition> {
        console.log("Saving to" + this.endpoints.flows);
        var postData = { definition: definition }
        return new Promise<FlowDefinition>((resolve, reject) => {
            axios.post(this.endpoints.flows + "?uuid=" + definition.uuid, postData, this.getRequestOptions()).then((response: AxiosResponse) => {
                console.log(response);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /** Makes sure our flow definition has the very basics */
    private initialize(definition: FlowDefinition) {

        if (!definition.nodes) {
            definition.nodes = [];
        }

        if (!definition._ui) {
            definition._ui = { nodes: {}, languages: {} }
        }
    }
}