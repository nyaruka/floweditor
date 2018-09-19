/* istanbul ignore file */
import axios, { AxiosResponse } from 'axios';
import { Endpoints, FlowDefinition } from '~/flowTypes';
import { Activity } from '~/services/ActivityManager';
import { Asset, AssetType } from '~/store/flowContext';

export interface FlowDetails {
    uuid: string;
    name: string;
    definition: FlowDefinition;
    dependencies: FlowDefinition[];
}

if (process.env.NODE_ENV === 'preview') {
    axios.defaults.baseURL = '/.netlify/functions/';
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

export const getAssets = (url: string, type: AssetType, id: string): Promise<Asset[]> => {
    if (!url) {
        return new Promise<Asset[]>((resolve, reject) => resolve([]));
    }

    return new Promise<Asset[]>((resolve, reject) => {
        axios
            .get(url)
            .then((response: AxiosResponse) => {
                const assets: Asset[] = response.data.results.map((result: any) => {
                    return {
                        name: result.name || result.text || result[id],
                        id: result[id],
                        type: result.type || type
                    };
                });
                resolve(assets);
            })
            .catch(error => reject(error));
    });
};

export const getFlow = (endpoints: Endpoints, uuid: string): Promise<Asset> =>
    new Promise<Asset>((resolve, reject) => {
        const url = `${endpoints.flows}/${uuid}/`;
        axios
            .get(url)
            .then((response: AxiosResponse) => {
                const flow = response.data;
                const name = flow.name || '';
                const asset = {
                    id: uuid,
                    name,
                    type: this.assetType,
                    content: flow
                };
                return resolve(asset);
            })
            .catch(error => reject(error));
    });

export const getBaseURL = (): string => {
    const location = window.location;
    return (
        location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
    );
};

export const getURL = (path: string): string => {
    let url = path;
    if (!url.endsWith('/') && url.indexOf('?') === -1) {
        url += '/';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Set url for netlify deployments
    if (process.env.NODE_ENV === 'preview') {
        url = '/.netlify/functions/' + url;
    }

    return `${getBaseURL() + url}`;
};
