const XRegExp = require('xregexp');

const SNAKED_CHARS = XRegExp('[^\\p{Letter}\\d]+');

interface BoolMap {
    [key: string]: boolean;
}

/**
 * Turns a string array into a bool map for constant lookup
 * @param {string[]} array - an array of strings, e.g. contact fields
 * @returns {BoolMap} A map of each string
 */
export function toBoolMap(array: string[]): BoolMap {
    return array.reduce((map: BoolMap, item: string) => {
        map[item] = true;
        return map;
    }, {});
}

export function addCommas(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Replaces spaces with underscores
 * @param {string} value - A space-separated string to be snaked, e.g. a raw flow field name ('my flow field')
 * @returns {string} A snaked string, e.g. 'my_flow_field'
 */
export function snakify(value: string): string {
    return XRegExp.replace(value.toLowerCase(), SNAKED_CHARS, '_', 'all');
}
