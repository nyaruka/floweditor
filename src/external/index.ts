/* istanbul ignore file */
import axios, { AxiosResponse } from 'axios';
import { SaveResult } from 'components/revisions/RevisionExplorer';
import { Endpoints, Exit, FlowDefinition, SPEC_VERSION, FlowDetails } from 'flowTypes';
import { currencies } from 'store/currencies';
import { Activity, RecentMessage } from 'store/editor';
import { Asset, AssetMap, Assets, AssetStore, AssetType } from 'store/flowContext';
import { assetListToMap } from 'store/helpers';
import { FlowTypes } from 'config/interfaces';

// Configure axios to always send JSON requests
axios.defaults.headers.post['Content-Type'] = 'application/javascript';
axios.defaults.responseType = 'json';
axios.defaults.timeout = 30000;

export const setHTTPTimeout = (millis: number) => {
  axios.defaults.timeout = millis;
};

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
      .catch((error: any) => reject(error))
  );

export interface Cancel {
  reject?: () => void;
}

export const saveRevision = (endpoint: string, definition: FlowDefinition): Promise<SaveResult> => {
  const csrf = getCookie('csrftoken');
  const headers = csrf ? { 'X-CSRFToken': csrf } : {};

  // update the spec version in our def to the current editor version
  let patch = '0';

  // honor any existing patch increments
  let release = definition.spec_version.split('.');
  if (release.length > 2) {
    patch = release[2];
  }

  definition.spec_version = [SPEC_VERSION, patch].join('.');

  return new Promise<SaveResult>((resolve, reject) => {
    axios
      .post(endpoint, definition, { headers })
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          resolve(response.data as SaveResult);
        } else {
          reject(response);
        }
      })
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
      .then((response: AxiosResponse) => {
        const recentMessages: RecentMessage[] = [];
        for (const row of response.data) {
          recentMessages.push({ text: row.text, sent: row.sent });
        }

        resolve(response.data as RecentMessage[]);
      })
      .catch(error => reject(error));
  });

/** Get the value for a named cookie */
export const getCookie = (name: string): string => {
  for (const cookie of document.cookie.split(';')) {
    const idx = cookie.indexOf('=');
    let key = cookie.substr(0, idx);
    let value = cookie.substr(idx + 1);

    // no spaces allowed
    key = key.trim();
    value = value.trim();

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
        resolve(response.data);
      })
      .catch(error => reject(error));
  });
};

export const fetchAsset = (assets: Assets, id: string): Promise<Asset> => {
  return new Promise<Asset>((resolve, reject) => {
    getAssets(assets.endpoint, assets.type, assets.id).then((results: Asset[]) => {
      resolve(results.find((asset: Asset) => asset.id === id));
    });
  });
};

interface AssetPage {
  assets: Asset[];
  next: string;
}

export const getAssetPage = (url: string, type: AssetType, id: string): Promise<AssetPage> => {
  return new Promise<AssetPage>((resolve, reject) => {
    axios
      .get(url)
      .then((response: AxiosResponse) => {
        const assets: Asset[] = response.data.results.map((result: any, idx: number) => {
          const asset = resultToAsset(result, type, id);
          asset.order = idx;
          return asset;
        });
        resolve({ assets, next: response.data.next });
      })
      .catch(error => reject(error));
  });
};

export const getAssets = async (url: string, type: AssetType, id: string): Promise<Asset[]> => {
  if (!url) {
    return new Promise<Asset[]>((resolve, reject) => resolve([]));
  }

  let assets: Asset[] = [];
  let pageUrl = url;
  while (pageUrl) {
    const assetPage = await getAssetPage(pageUrl, type, id);
    assets = assets.concat(assetPage.assets);
    pageUrl = assetPage.next;
  }
  return assets;
};

export const getFlowType = (flow: any) => {
  switch (flow.type) {
    case 'message':
      return FlowTypes.MESSAGING;
    case 'voice':
      return FlowTypes.VOICE;
    case 'background':
      return FlowTypes.MESSAGING_BACKGROUND;
    case 'survey':
      return FlowTypes.MESSAGING_OFFLINE;
  }
};

export const resultToAsset = (result: any, type: AssetType, id: string): Asset => {
  const idKey = id || 'uuid';

  let assetType = type;

  if (type === AssetType.Flow && result.type) {
    switch (result.type) {
      case 'message':
        result.type = FlowTypes.MESSAGING;
        break;
      case 'voice':
        result.type = FlowTypes.VOICE;
        break;
      case 'background':
        result.type = FlowTypes.MESSAGING_BACKGROUND;
        break;
      case 'survey':
        result.type = FlowTypes.MESSAGING_OFFLINE;
        break;
    }
  }

  if (type !== AssetType.Flow && result.type) {
    assetType = result.type;
  }

  const asset: Asset = {
    name: result.name || result.text || result.label || result[idKey],
    id: result[idKey],
    type: assetType
  };

  delete result[idKey];
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

  const inputLower = input.toLowerCase();
  // some assets have ids worth matching
  if (asset.type === AssetType.Currency || asset.type === AssetType.Language) {
    if (asset.id.toLowerCase().includes(inputLower)) {
      return true;
    }
  }
  return asset.name.toLowerCase().includes(inputLower);
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
      classifiers: {
        endpoint: getURL(endpoints.classifiers),
        type: AssetType.Classifier,
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
      globals: {
        endpoint: getURL(endpoints.globals),
        type: AssetType.Global,
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
      templates: {
        endpoint: getURL(endpoints.templates),
        type: AssetType.Template,
        items: {}
      },
      ticketers: {
        endpoint: getURL(endpoints.ticketers),
        type: AssetType.Ticketer,
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
    ['languages', 'fields', 'groups', 'labels', 'globals', 'classifiers', 'ticketers'].forEach(
      (storeId: string) => {
        const store = assetStore[storeId];
        fetches.push(
          getAssets(store.endpoint, store.type, store.id || 'uuid').then((assets: Asset[]) => {
            store.items = assetListToMap(assets);
            store.prefetched = true;
          })
        );
      }
    );

    // wait for our prefetches to finish
    Promise.all(fetches).then((results: any) => {
      resolve(assetStore);
    });
  });
};

export const getFlowDetails = (revisions: Assets, id: string = null): Promise<FlowDetails> => {
  return new Promise<FlowDetails>((resolve, reject) => {
    (async () => {
      let revisionToLoad = id;
      if (!revisionToLoad) {
        try {
          const response = await axios.get(`${revisions.endpoint}?version=${SPEC_VERSION}`);
          if (response.data.results.length > 0) {
            revisionToLoad = response.data.results[0].id;
          }
        } catch (error) {
          reject(new Error("Couldn't reach revisions endpoint"));
        }
      }

      if (revisionToLoad) {
        const url = `${revisions.endpoint}${revisionToLoad}?version=${SPEC_VERSION}`;
        axios
          .get(url)
          .then((response: AxiosResponse) => {
            const details = response.data as FlowDetails;
            return resolve(details);
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
  return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
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
  // if (process.env.NODE_ENV === "preview") {
  // url = "/.netlify/functions/" + url;
  // }

  const result = `${getBaseURL() + url}`;
  return result;
};

export const showHelpArticle = (link: string) => {
  window.open(link, 'floweditor_help');
};
