import { ComponentClass, SFC, ReactElement } from 'react';
import { ShallowWrapper, ReactWrapper } from 'enzyme';
import { FlowDefinition } from '../flowTypes';

const request = require('sync-request');

const XRegExp = require('xregexp');

const SNAKED_CHARS = XRegExp('[^\\p{Letter}\\d]+');

interface BoolMap {
    [key: string]: boolean;
}

/**
 * Turns a string array into a bool map for constant lookup
 * @param {string[]} array - an array of strings, e.g. contact fields
 * @returns {object} A map of each string
 */
export function toBoolMap(array: string[]): BoolMap {
    return array.reduce((map: BoolMap, item: string) => {
        map[item] = true;
        return map;
    }, {});
}

/**
 * Inserts commas into numbers where appropriate for better readability
 * @param {number} value - A number, e.g. 10000
 * @returns {string} A comma-separated string, e.g. 10,000
 */
export function addCommas(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Replaces spaces with underscores
 * @param {string} value - A space-separated string to be snaked, e.g. a raw flow field name ('my flow field')
 * @returns {string} A snaked string, e.g. 'my_flow_field'
 */
export function snakify(value: string): string {
    return XRegExp.replace(value.toLowerCase().trim(), SNAKED_CHARS, '_', 'all');
}

/**
 * Returns a React component's name so we can attach it to a HOC's displayName property and view it in RDT
 * @param {ComponentClass | SFC} Component - A React component
 * @returns {string} The component's name
 */
export function getDisplayName(HOCName: string, Component: ComponentClass | SFC): string {
    const ComponentDisplayName = Component.displayName || Component.name || 'Component';
    return `${HOCName}(${ComponentDisplayName})`;
}

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
 * @param {ReactWrapper|ShallowWrapper} componentWrapper - Rendered componentWrapper (result of mount, shallow, or render)
 * @param  {string} snacName - Name of `data-spec` attribute value to find
 * @param {string|Function} (Optional) typeFilter - (Optional) Expected type of the wrappers (defaults to all HTML tags)
 * @returns {ReactWrapper|ReactWrapper[]|ShallowWrapper|ShallowWrapper[]} matching DOM components
 */
export function getSpecWrapper(
    componentWrapper: ReactWrapper | ShallowWrapper,
    specName: string
): ShallowWrapper | ReactWrapper {
    return componentWrapper.find(`[${DATA_SPEC_ATTRIBUTE_NAME}="${specName}"]`);
}

/**
 * Returns true if a given UUID matches v4 format
 * @param {string} uuid - A version 4 UUID (no braces, uppercase OK)
 * @returns {boolean}
 */
export function validUUID(uuid: string): boolean {
    const regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    return regex.test(uuid);
}
