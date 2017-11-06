import * as React from 'react';
import axios, { AxiosResponse } from 'axios';
import * as update from 'immutability-helper';
import { IEndpoints } from '../services/EditorConfig';
import { IFlowDefinition, IStartFlow } from '../flowTypes';
import { IActivity } from '../services/ActivityManager';
import __flow_editor_config__ from '../flowEditorConfig';

export interface IFlowDetails {
    uuid: string;
    name: string;
    definition: IFlowDefinition;
    dependencies: IFlowDefinition[];
}

// prettier-ignore
export type TGetActivity = (flowUUID: string, activityEndpoint?: string, headers?: {}) => Promise<IActivity>;
// prettier-ignore
export type TGetFlows = (flowsEndpoint?: string, headers?: {}, flowName?: string) => Promise<IFlowDetails[]>;
// prettier-ignore
export type TGetFlow = (uuidToGet: string, dependencies?: boolean, flowsEndpoint?: string, headers?: {}) => Promise<IFlowDetails>;
export type TSaveFlow = (definition: IFlowDefinition, flowsEndpoint?: string, headers?: {}) => void;

const {
    endpoints: { activity: ACTIVITY_ENDPOINT, flows: FLOWS_ENDPOINT }
}: IFlowEditorConfig = __flow_editor_config__;

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
    ): Promise<IActivity> {
        return new Promise<IActivity>((resolve, reject) =>
            axios
                .get(`${activityEndpoint}?flow=${flowUUID}`, { headers })
                .then((response: AxiosResponse) => resolve(response.data as IActivity))
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
    ): Promise<IFlowDetails[]> {
        return new Promise<IFlowDetails[]>((resolve, reject) =>
            axios
                .get(flowsEndpoint, { headers })
                .then((response: AxiosResponse) => {
                    const results: IFlowDetails[] = response.data.results;
                    if (flowName) {
                        const filteredResults: IFlowDetails[] = results.filter(
                            (result: IFlowDetails) => (result.name === flowName)
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
    ): Promise<IFlowDetails> {
        return new Promise<IFlowDetails>((resolve, reject) =>
            axios
                .get(`${flowsEndpoint}?uuid=${uuidToGet}&dependencies=${dependencies}`, headers)
                .then((response: AxiosResponse) => {
                    const { data: { results: flows } } = response;
                    const details: IFlowDetails = flows.reduce(
                        (acc: IFlowDetails, val: IFlowDetails) => {
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
                            definition: null as IFlowDefinition,
                            dependencies: [] as IFlowDefinition[]
                        }
                    );
                    resolve(details);
                })
                .catch(error => reject(error))
        )
    }

    public saveFlow(
        definition: IFlowDefinition,
        flowsEndpoint: string = this.flowsEndpoint,
        headers = {}
    ) {
        const postData = { ...definition };
        return new Promise<IFlowDefinition>((resolve, reject) =>
            axios
                .post(`${flowsEndpoint}?uuid=${definition.uuid}`, postData, headers)
                .then((response: AxiosResponse) => resolve(response.data.results))
                .catch(error => reject(error))
        );
    }
}

export default External;
