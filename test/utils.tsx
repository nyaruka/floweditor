import { FlowDefinition } from '../src/FlowDefinition';
var request = require('sync-request');


function getFlow(name: string): FlowDefinition {
    var definition = request('GET', 'base/test_flows/' + name + '.json').getBody();
    return JSON.parse(definition) as FlowDefinition;
}

export function getFavorites(): FlowDefinition {
    return getFlow("favorites");
}

export function dump(object: any) {
    console.log(JSON.stringify(object, null, 1));
}