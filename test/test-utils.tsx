import { FlowDefinition } from '../src/FlowDefinition';

const request = require('sync-request');


function getFlow(name: string): FlowDefinition {
    const definition = request('GET', 'base/test_flows/' + name + '.json').getBody();
    return JSON.parse(definition) as FlowDefinition;
}

export function getFavorites(): FlowDefinition {
    return getFlow('favorites');
}

export function getTest(): FlowDefinition {
    return getFlow('a4f64f1b-85bc-477e-b706-de313a022979');
}

export function dump(object: any) {
    console.log(JSON.stringify(object, null, 1));
}
