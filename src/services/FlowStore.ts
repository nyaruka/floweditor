import axios from 'axios';
import { AxiosResponse } from 'axios';
import { FlowDefinition } from '../flowTypes';

const storage = require('local-storage');

export class FlowStore {
    private static singleton: FlowStore = new FlowStore();

    static get(): FlowStore {
        return FlowStore.singleton;
    }

    private constructor() {}

    reset() {
        storage.remove('flow');
    }

    getFlowFromStore(uuid: string): FlowDefinition {
        var flow = storage.get('flow');
        if (flow != null) {
            return flow as FlowDefinition;
        } else {
            // return {
            //     name: 'New Flow',
            //     language: null,
            //     uuid: uuid,
            //     nodes: [],
            //     localization: null,
            //     _ui: {
            //         nodes: {},
            //         languages: {}
            //     }
            // };
        }
    }

    loadFromUrl(url: string, token: string, onLoad: Function) {
        return axios.get(url).then((response: AxiosResponse) => {
            var json = eval(response.data);
            let definition = json as FlowDefinition;
            onLoad(definition);
        });
    }

    save(definition: FlowDefinition) {
        console.log('Saving: ', definition);
        storage.set('flow', definition);
    }
};
