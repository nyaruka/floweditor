/* istanbul ignore file */
import axios, { AxiosResponse } from 'axios';
import { Revision } from '~/components/revisions/RevisionExplorer';
import { Endpoints, Exit, FlowDefinition } from '~/flowTypes';
import { currencies } from '~/store/currencies';
import { Activity, RecentMessage } from '~/store/editor';
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

export interface Cancel {
    reject?: () => void;
}

export const saveRevision = (endpoint: string, definition: FlowDefinition): Promise<Revision> => {
    const csrf = getCookie('csrftoken');
    const headers = csrf ? { 'X-CSRFToken': csrf } : {};
    return new Promise<Revision>((resolve, reject) => {
        axios
            .post(endpoint, definition, { headers })
            .then((response: AxiosResponse) => resolve(response.data.revision as Revision))
            .catch(error => reject(error));
    });
};
export const getRecentMessages = (
    recentsEndpoint: string,
    exit: Exit,
    cancel: Cancel
): Promise<RecentMessage[]> =>
    new Promise<RecentMessage[]>((resolve, reject) => {
        cancel.reject = reject;
        return axios
            .get(`${recentsEndpoint}?exits=${exit.uuid}&to=${exit.destination_uuid}`)
            .then((response: AxiosResponse) => resolve(response.data as RecentMessage[]))
            .catch(error => reject(error));
    });

/** Get the value for a named cookie */
export const getCookie = (name: string): string => {
    for (const cookie of document.cookie.split(';')) {
        const [key, value] = cookie.split('=', 2);
        if (key === name) {
            return value;
        }
    }
    return null;
};

export const postNewAsset = (assets: Assets, payload: any): Promise<Asset> => {
    // if we have a csrf in our cookie, pass it along as a header
    const csrf = getCookie('csrftoken');
    const headers = csrf ? { 'X-CSRFToken': csrf } : {};

    return new Promise<Asset>((resolve, reject) => {
        axios
            .post(assets.endpoint, payload, { headers })
            .then((response: AxiosResponse) => {
                resolve(resultToAsset(response.data, assets.type, assets.id));
            })
            .catch(error => reject(error));
    });
};

export const getAssets = (url: string, type: AssetType, id: string): Promise<Asset[]> => {
    if (!url) {
        return new Promise<Asset[]>((resolve, reject) => resolve([]));
    }

    return new Promise<Asset[]>((resolve, reject) => {
        axios
            .get(url)
            .then((response: AxiosResponse) => {
                const assets: Asset[] = response.data.results.map((result: any) =>
                    resultToAsset(result, type, id)
                );

                resolve(assets);
            })
            .catch(error => reject(error));
    });
};

export const resultToAsset = (result: any, type: AssetType, id: string): Asset => {
    const idKey = id || 'uuid';

    const asset: Asset = {
        name: result.name || result.text || result.label || result[idKey],
        id: result[idKey],
        type: result.type || type
    };

    delete result[idKey];
    delete result.type;
    delete result.name;
    delete result.text;

    asset.content = result;

    return asset;
};

export const isMatch = (
    input: string,
    asset: Asset,
    shouldExclude: (asset: Asset) => boolean
): boolean => {
    if (shouldExclude && shouldExclude(asset)) {
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
    shouldExclude?: (asset: Asset) => boolean
): Asset[] => {
    const search = query.toLowerCase();
    let matches = Object.keys(assets)
        .map(key => assets[key])
        .filter((asset: Asset) => isMatch(search, asset, shouldExclude));

    // include our additional matches if we have any
    matches = matches
        .concat(additionalOptions || [])
        .filter((asset: Asset) => isMatch(search, asset, shouldExclude));

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
            revisions: {
                endpoint: getURL(endpoints.revisions),
                type: AssetType.Revision,
                id: 'id',
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
                id: 'resthook',
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
        ['languages', 'fields', 'groups', 'labels'].forEach((storeId: string) => {
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
        Promise.all(fetches).then((results: any) => {
            resolve(assetStore);
        });
    });
};

export const getFlowDefinition = (
    revisions: Assets,
    id: string = null
): Promise<FlowDefinition> => {
    return new Promise<FlowDefinition>((resolve, reject) => {
        (async () => {
            let revisionToLoad = id;
            if (!revisionToLoad) {
                const response = await axios.get(`${revisions.endpoint}`);
                if (response.data.results.length > 0) {
                    revisionToLoad = response.data.results[0].id;
                }
            }

            if (revisionToLoad) {
                const url = `${revisions.endpoint}${revisionToLoad}`;
                axios
                    .get(url)
                    .then((response: AxiosResponse) => {
                        const definition = response.data as FlowDefinition;
                        return resolve(definition);
                    })
                    .catch(error => reject(error));
            } else {
                reject(new Error('No revision found for flow'));
            }
        })();
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
    if (!url.endsWith('/') && url.indexOf('?') === -1 && url.indexOf('groups') === -1) {
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
