var XRegExp = require('xregexp');

const SNAKED_CHARS = XRegExp('[^\\p{Letter}\\d]+');

/** Turns a string array into a bool map */
export function toBoolMap(array: string[]): { [item: string]: boolean } {
    var map: { [item: string]: boolean } = {};
    for (let item of array) {
        map[item] = true;
    }
    return map;
}

export function addCommas(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function snakify(value: string): string {
    if (value) {
        value = XRegExp.replace(value.toLowerCase(), SNAKED_CHARS, '_', 'all');
        return value;
    } else {
        return value;
    }
}