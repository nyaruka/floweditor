import { ComponentClass, SFC, ReactElement } from 'react';
import { ShallowWrapper, ReactWrapper } from 'enzyme';
import { substArr } from '@ycleptkellan/substantive';

const SNAKED_CHARS: RegExp = /\s+(?=\S)/g;

const V4_UUID: RegExp = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

interface BoolMap {
    [key: string]: boolean;
}

/**
 * Turns a string array into a bool map for constant lookup
 * @param {Array.<string>} array - an array of strings, e.g. contact fields
 * @returns {object} A map of each string
 */
export const toBoolMap = (array: string[]): BoolMap =>
    array.reduce(
        (map: BoolMap, item: string) => ({
            ...map,
            [item]: true
        }),
        {}
    );

/**
 * Inserts commas into numbers where appropriate for better readability
 * @param {number} value - A number, e.g. 10000
 * @returns {string} A comma-separated string, e.g. 10,000
 */
export const addCommas = (value: number): string =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * Replaces spaces with underscores
 * @param {string} value - A space-separated string to be snaked, e.g. a raw flow field name ('my flow field')
 * @returns {string} A snaked string, e.g. 'my_flow_field'
 */
export const snakify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(SNAKED_CHARS, '_');

/**
 * Returns a React component's name so we can attach it to a HOC's displayName property and view it in RDT
 * @param {ComponentClass | SFC} Component - A React component
 * @returns {string} The component's name
 */
export const getDisplayName = (
    WrappedComponent: ComponentClass | SFC
): string =>
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

/**
 * Borrowed from EventBrite: https://github.com/eventbrite/javascript/blob/master/react/testing.md#finding-nodes
 * Finds all instances of components in the rendered `componentWrapper` that are DOM components
 * with the `data-spec` attribute matching `name`.
 * @param {ReactWrapper|ShallowWrapper} componentWrapper - Rendered componentWrapper (result of mount, shallow, or render)
 * @param  {string} snacName - Name of `data-spec` attribute value to find
 * @param {string|Function} (Optional) typeFilter - (Optional) Expected type of the wrappers (defaults to all HTML tags)
 * @returns {ReactWrapper|ReactWrapper[]|ShallowWrapper|ShallowWrapper[]} Matching DOM components
 */
export const getSpecWrapper = (
    componentWrapper: ReactWrapper<{}, {}> | ShallowWrapper<{}, {}>,
    specName: string,
    attributeName: string = 'data-spec'
): any => {
    return componentWrapper.find(`[${attributeName}="${specName}"]`);
};

/**
 * Returns true if a given UUID matches v4 format
 * @param {string} uuid - A version 4 UUID (no braces, uppercase OK)
 * @returns {boolean}
 */
export const validUUID = (uuid: string): boolean => V4_UUID.test(uuid);

/**
 * Returns a given string in title case, e.g. 'full name' becomes 'Full Name'
 * @param {string} str - string to be title-cased
 * @returns {string} Title-cased string
 */
export const titleCase = (str: string): string =>
    str.replace(
        /\b\w+/g,
        s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase()
    );

/**
 * Helper that determines whether or not `react-select`'s error class should be applied
 * @param {number} errors - The number of errors a form field component may hold in its state
 * @returns {string} Class to apply
 */
export const getSelectClass = (errors: number): string => {
    if (errors === 0) {
        return '';
    }
    // We use a global selector here for react-select
    return 'select-invalid';
};

/**
 * Simple comparison of basic objects (no methods and DOM nodes; property order important)
 * @param {object} objA - basic object
 * @param {object} objB - basic object
 * @returns {boolean}
 */
export const jsonEqual = (objA: object, objB: object): boolean =>
    JSON.stringify(objA) === JSON.stringify(objB);

/**
 * Helper that reorders a list of items given a start and end index
 * @param {Array} list
 * @param {number} startIndex
 * @param {number} endIndex
 */
export const reorderList = (
    list: any[],
    startIndex: number,
    endIndex: number
): any[] => {
    if (!substArr(list)) {
        return [];
    }
    const reorderedList = [...list];
    const [removed] = reorderedList.splice(startIndex, 1);
    reorderedList.splice(endIndex, 0, removed);
    return reorderedList;
};

/**
 * Checks whether any of a list of error strings contain one or more queries.
 * Used to determine whether a particular error has been encountered.
 * @param {Array.<string>} errors - list of error messages
 * @param {Array.<string>} queries  - list of queries
 * @returns {boolean}
 */
export const hasErrorType = (errors: string[], queries: string[]): boolean => {
    if (!errors.length) {
        return false;
    }

    for (const error of errors) {
        for (const query of queries) {
            if (error.indexOf(query) > -1) {
                return true;
            }
        }
    }

    return false;
};
