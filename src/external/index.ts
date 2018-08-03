import axios, { AxiosResponse } from 'axios';
import { FlowDefinition } from '~/flowTypes';
import { Activity } from '~/services/ActivityManager';

export interface FlowDetails {
    uuid: string;
    name: string;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
}

const fromPR = !!process.env.PULL_REQUEST;
console.log(process.env.PULL_REQUEST, fromPR);
if (process.env.NODE_ENV === 'preview') {
    let baseURL = process.env.URL;
    if (fromPR) {
        baseURL = process.env.DEPLOY_PRIME_URL;
    }
    axios.defaults.baseURL = `${baseURL}/.netlify/functions/`;
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
