import axios, { AxiosResponse } from 'axios';
import { FlowDefinition, Endpoints, StartFlow } from '../flowTypes';
import { Activity } from '../services/ActivityManager';

export interface FlowDetails {
    uuid: string;
    name: string;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
}

// Configure axios to always send JSON requests
axios.defaults.headers.post['Content-Type'] = 'application/javascript';
axios.defaults.responseType = 'json';

/**
 * Gets the path activity and the count of active particpants at each node
 * @param {string} flowUUID - The UUID of the current flow
 * @param {string} activityEndpoint - The URL path to the endpoint providing this data
 * @returns {Object} - An object representation of the flow's activty
 */
export const getActivity = (
    activityEndpoint: string,
    flowUUID: string,
    headers = {}
): Promise<Activity> =>
    new Promise<Activity>((resolve, reject) =>
        axios
            .get(`${activityEndpoint}?flow=${flowUUID}`, { headers })
            .then((response: AxiosResponse) => resolve(response.data as Activity))
            .catch(error => reject(error))
    );

/**
 * Gets a list of all flows, optionally allowing for filtering by name
 * @param {string} flowsEndpoint - The URL path to the endpoint providing this data
 * @param {string} flowName - The name of the flow to filter against
 * @returns {Array.<Object>} - An array containing object representations of one or more flows
 */
export const getFlows = (
    flowsEndpoint: string,
    headers = {},
    flowName?: string
): Promise<FlowDetails[]> =>
    new Promise<FlowDetails[]>((resolve, reject) =>
        axios
            .get(flowsEndpoint, { headers })
            .then((response: AxiosResponse) => {
                const { data: { results } } = response;

                if (flowName) {
                    const filteredResults: FlowDetails[] = results.filter(
                        (result: FlowDetails) => result.name === flowName
                    );

                    resolve(filteredResults);
                }

                resolve(results);
            })
            .catch(error => reject(error))
    );

/**
 * Gets a flow definition for a given flow uuid
 * @param {string} flowsEndpoint - The URL path to the endpoint providing this data
 * @param {string} uuidToGet - The uuid of the flow to fetch
 * @param {boolean} dependencies - Whethor or not to fetch the flow's dependencies
 * @returns {Object} - An object representation of the flow
 */
export const getFlow = (
    flowsEndpoint: string,
    uuidToGet: string,
    dependencies = false,
    headers = {}
): Promise<FlowDetails> =>
    new Promise<FlowDetails>((resolve, reject) =>
        axios
            .get(`${flowsEndpoint}?uuid=${uuidToGet}&dependencies=${dependencies}`, headers)
            .then((response: AxiosResponse) => resolve(response.data.results[0]))
            .catch(error => reject(error))
    );

export const saveFlow = (definition: FlowDefinition, flowsEndpoint: string, headers = {}) => {
    const postData = { ...definition };
    return new Promise<FlowDefinition>((resolve, reject) =>
        axios
            .post(`${flowsEndpoint}?uuid=${definition.uuid}`, postData, headers)
            .then((response: AxiosResponse) => resolve(response.data.results))
            .catch(error => reject(error))
    );
};
