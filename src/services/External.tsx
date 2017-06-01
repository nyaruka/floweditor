import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Endpoints } from '../services/Config';
import { FlowDefinition } from '../FlowDefinition';

export interface FlowDetails {
    uuid: string;
    name: string;
    definition: FlowDefinition;
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
    public getFlow(uuid: string): Promise<FlowDefinition> {
        // console.log("Getting flow:", uuid, this.endpoints.flows + "?uuid=" + uuid);
        return new Promise<FlowDefinition>((resolve, reject) => {
            axios.get(this.endpoints.flows + "?uuid=" + uuid, this.getRequestOptions()).then((response: AxiosResponse) => {

                var definition: FlowDefinition = null;
                var flowDetails = response.data.results as FlowDetails[];
                if (flowDetails.length > 0) {
                    definition = flowDetails[0].definition;
                    if (!definition.name) {
                        definition.name = flowDetails[0].name;
                    }

                    if (!definition.uuid) {
                        definition.uuid = uuid;
                    }
                }

                this.initialize(definition);
                resolve(definition);
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
            definition._ui = { nodes: {} }
        }
    }
}