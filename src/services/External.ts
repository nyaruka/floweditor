import * as React from 'react';
import axios, { AxiosResponse } from 'axios';
import * as update from 'immutability-helper';
import { Endpoints } from '../services/EditorConfig';
import { FlowDefinition, StartFlow } from '../flowTypes';
import { Activity } from '../services/ActivityManager';
import { endpoints } from '../flowEditorConfig';

export interface FlowDetails {
    uuid: string;
    name: string;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
}

// prettier-ignore
export type GetActivity = (flowUUID: string, activityEndpoint?: string, headers?: {}) => Promise<Activity>;
// prettier-ignore
export type GetFlows = (flowsEndpoint?: string, headers?: {}, flowName?: string) => Promise<FlowDetails[]>;
// prettier-ignore
export type GetFlow = (uuidToGet: string, dependencies?: boolean, flowsEndpoint?: string, headers?: {}) => Promise<FlowDetails>;
export type SaveFlow = (definition: FlowDefinition, flowsEndpoint?: string, headers?: {}) => void;

const { activity: ACTIVITY_ENDPOINT, flows: FLOWS_ENDPOINT }: Endpoints = endpoints;

export { ACTIVITY_ENDPOINT };
export { FLOWS_ENDPOINT };

/** Configure axios to always send JSON requests */
axios.defaults.headers.post['Content-Type'] = 'application/javascript';
axios.defaults.responseType = 'json';

class External {
    private activityEndpoint: string = ACTIVITY_ENDPOINT;
    private flowsEndpoint: string = FLOWS_ENDPOINT;

    constructor() {
        this.getActivity = this.getActivity.bind(this);
        this.getFlows = this.getFlows.bind(this);
        this.getFlow = this.getFlow.bind(this);
        this.saveFlow = this.saveFlow.bind(this);
    }

    /**
     * Gets the path activity and the count of active particpants at each node
     * @param {string} flowUUID - The UUID of the current flow
     * @param {string} activityEndpoint - The URL path to the endpoint providing this data
     * @returns {Object} - An object representation of the flow's activty
     */
    public getActivity(
        flowUUID: string,
        activityEndpoint: string = this.activityEndpoint,
        headers = {}
    ): Promise<Activity> {
        return new Promise<Activity>((resolve, reject) =>
            axios
                .get(`${activityEndpoint}?flow=${flowUUID}`, { headers })
                .then((response: AxiosResponse) => resolve(response.data as Activity))
                .catch(error => reject(error))
        );
    }

    /**
     * Gets a list of all flows, optionally allowing for filtering by name
     * @param {string} flowsEndpoint - The URL path to the endpoint providing this data
     * @param {string} flowName - The name of the flow to filter against
     * @returns {Array.<Object>} - An array containing object representations of one or more flows
     */
    public getFlows(
        flowsEndpoint: string = this.flowsEndpoint,
        headers = {},
        flowName?: string
    ): Promise<FlowDetails[]> {
        return new Promise<FlowDetails[]>((resolve, reject) =>
            axios
                .get(flowsEndpoint, { headers })
                .then((response: AxiosResponse) => {
                    const results: FlowDetails[] = response.data.results;
                    if (flowName) {
                        const filteredResults: FlowDetails[] = results.filter(
                            (result: FlowDetails) => result.name === flowName
                        );
                        resolve(filteredResults);
                    } else {
                        resolve(results);
                    }
                })
                .catch(error => reject(error))
        );
    }

    /**
     * Gets a flow definition for a given flow uuid
     * @param {string} flowsEndpoint - The URL path to the endpoint providing this data
     * @param {string} uuidToGet - The uuid of the flow to fetch
     * @param {boolean} dependencies - Whethor or not to fetch the flow's dependencies
     * @returns {Object} - An object representation of the flow
     */
    public getFlow(
        uuidToGet: string,
        dependencies = false,
        flowsEndpoint: string = this.flowsEndpoint,
        headers = {}
    ): Promise<FlowDetails> {
        return new Promise<FlowDetails>((resolve, reject) =>
            axios
                .get(`${flowsEndpoint}?uuid=${uuidToGet}&dependencies=${dependencies}`, headers)
                .then((response: AxiosResponse) => {
                    const { data: { results: flows } } = response;
                    const details: FlowDetails = flows.reduce(
                        (acc: FlowDetails, val: FlowDetails) => {
                            if (!val.definition.uuid) {
                                val = update(val, {
                                    definition: {
                                        uuid: {
                                            $set: val.uuid
                                        }
                                    }
                                });
                            }
                            if (val.uuid === uuidToGet) {
                                acc = {
                                    ...acc,
                                    definition: val.definition,
                                    name: val.name
                                };
                            } else {
                                acc = {
                                    ...acc,
                                    dependencies: [...acc.dependencies, val.definition]
                                };
                            }
                            return acc;
                        },
                        {
                            uuid: uuidToGet,
                            name: null,
                            definition: null as FlowDefinition,
                            dependencies: [] as FlowDefinition[]
                        }
                    );
                    resolve(details);
                })
                .catch(error => reject(error))
        );
    }

    public saveFlow(
        definition: FlowDefinition,
        flowsEndpoint: string = this.flowsEndpoint,
        headers = {}
    ) {
        const postData = { ...definition };
        return new Promise<FlowDefinition>((resolve, reject) =>
            axios
                .post(`${flowsEndpoint}?uuid=${definition.uuid}`, postData, headers)
                .then((response: AxiosResponse) => resolve(response.data.results))
                .catch(error => reject(error))
        );
    }
}

export default External;
