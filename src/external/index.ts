/* istanbul ignore file */
import axios, { AxiosResponse } from 'axios';
import { Endpoints, FlowDefinition } from '~/flowTypes';
import { Activity } from '~/services/ActivityManager';
import { currencies } from '~/store/currencies';
import { Asset, AssetMap, Assets, AssetStore, AssetType } from '~/store/flowContext';
import { assetListToMap } from '~/store/helpers';

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

export const isMatch = (input: string, asset: Asset, exclude: string[]): boolean => {
    if ((exclude || []).find((id: string) => asset.id === id)) {
        return false;
    }

    return asset.name.toLowerCase().includes(input);
};

/**
 * Searches an AssetMap for a substring
 */
export const searchAssetMap = (
    query: string,
    assets: AssetMap,
    additionalOptions?: Asset[],
    excludeOptions?: string[]
): Asset[] => {
    const search = query.toLowerCase();
    let matches = Object.keys(assets)
        .map(key => assets[key])
        .filter((asset: Asset) => isMatch(search, asset, excludeOptions));

    // include our additional matches if we have any
    matches = matches
        .concat(additionalOptions || [])
        .filter((asset: Asset) => isMatch(search, asset, excludeOptions));

    return matches;
};

export const createAssetStore = (endpoints: Endpoints): Promise<AssetStore> => {
    return new Promise<AssetStore>((resolve, reject) => {
        const assetStore: AssetStore = {
            channels: {
                endpoint: getURL(endpoints.channels),
                type: AssetType.Channel,
                items: {}
            },
            languages: {
                endpoint: getURL(endpoints.languages),
                type: AssetType.Language,
                items: {},
                id: 'iso'
            },
            flows: {
                endpoint: getURL(endpoints.flows),
                type: AssetType.Flow,
                items: {}
            },
            fields: {
                endpoint: getURL(endpoints.fields),
                type: AssetType.Field,
                id: 'key',
                items: {}
            },
            groups: {
                endpoint: getURL(endpoints.groups),
                type: AssetType.Group,
                items: {}
            },
            labels: {
                endpoint: getURL(endpoints.labels),
                type: AssetType.Label,
                items: {}
            },
            results: {
                type: AssetType.Result,
                items: {}
            },
            recipients: {
                endpoint: getURL(endpoints.recipients),
                type: AssetType.Contact || AssetType.Group || AssetType.URN,
                items: {},
                id: 'id'
            },
            resthooks: {
                endpoint: getURL(endpoints.resthooks),
                type: AssetType.Resthook,
                id: 'slug',
                items: {}
            },
            currencies: {
                type: AssetType.Currency,
                id: 'id',
                items: currencies,
                prefetched: true
            }
        };

        // prefetch some of our assets
        const fetches: any[] = [];
        ['languages', 'fields', 'groups'].forEach((storeId: string) => {
            const store = assetStore[storeId];
            fetches.push(
                getAssets(store.endpoint, store.type, store.id || 'uuid').then(
                    (assets: Asset[]) => {
                        store.items = assetListToMap(assets);
                        store.prefetched = true;
                    }
                )
            );
        });

        // wait for our prefetches to finish
        Promise.all(fetches);

        resolve(assetStore);
    });
};

export const getFlow = (flows: Assets, uuid: string): Promise<Asset> => {
    return new Promise<Asset>((resolve, reject) => {
        const url = `${flows.endpoint}${uuid}/`;
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
};

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

    const result = `${getBaseURL() + url}`;
    return result;
};
