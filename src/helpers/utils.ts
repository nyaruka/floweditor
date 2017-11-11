import { ComponentClass, SFC, ReactElement } from 'react';
import { ShallowWrapper, ReactWrapper } from 'enzyme';
import { FlowDefinition } from '../flowTypes';

const SNAKED_CHARS = /\s+(?=\S)/g;
const V4_UUID = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

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
    return value
        .toLowerCase()
        .trim()
        .replace(SNAKED_CHARS, '_');
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

export const DATA_SPEC_ATTRIBUTE_NAME: string = 'data-spec';

/**
 * NOTE: borrowed from EventBrite: https://github.com/eventbrite/javascript/blob/master/react/testing.md#finding-nodes
 * Finds all instances of components in the rendered `componentWrapper` that are DOM components
 * with the `data-spec` attribute matching `name`.
 * @param {ReactWrapper|ShallowWrapper} componentWrapper - Rendered componentWrapper (result of mount, shallow, or render)
 * @param  {string} snacName - Name of `data-spec` attribute value to find
 * @param {string|Function} (Optional) typeFilter - (Optional) Expected type of the wrappers (defaults to all HTML tags)
 * @returns {ReactWrapper|ReactWrapper[]|ShallowWrapper|ShallowWrapper[]} Matching DOM components
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
    return V4_UUID.test(uuid);
}

/**
 * Returns a given string in title case, e.g. 'full name' becomes 'Full Name'
 * @param {string} str - string to be title-cased
 * @returns {string} Title-cased string
 */
export function titleCase(str: string): string {
    return str.replace(/\b\w+/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());
}
