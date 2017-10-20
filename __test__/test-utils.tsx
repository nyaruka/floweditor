import { ReactWrapper } from 'enzyme';
import { ReactElement } from 'react';
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

export const DATA_SPEC_ATTRIBUTE_NAME: string = 'data-spec';

/**
 * NOTE: borrowed from EventBrite: https://github.com/eventbrite/javascript/blob/master/react/testing.md#finding-nodes
 * Finds all instances of components in the rendered `componentWrapper` that are DOM components
 * with the `data-spec` attribute matching `name`.
 * @param componentWrapper - Rendered componentWrapper (result of mount, shallow, or render)
 * @param - Name of `data-spec` attribute value to find
 * @param typeFilter - (Optional) Expected type of the wrappers (defaults to all HTML tags)
 * @returns All matching DOM components
 */
export const getSpecWrapper = (
    componentWrapper: ReactWrapper,
    specName: string,
    typeFilter: string
): ReactElement<any> => {
    let specWrappers;

    if (!typeFilter) {
        specWrappers = componentWrapper.find(`[${DATA_SPEC_ATTRIBUTE_NAME}="${specName}"]`);
    } else {
        specWrappers = componentWrapper.findWhere(
            wrapper =>
                wrapper.prop(DATA_SPEC_ATTRIBUTE_NAME) === specName && wrapper.type() === typeFilter
        );
    }

    return specWrappers;
};
