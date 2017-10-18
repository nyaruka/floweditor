import XRegExp from 'xregexp';

const SNAKED_CHARS = XRegExp('[^\\p{Letter}\\d]+');

interface BoolMap {
    [item: string]: boolean;
}

/**
 * Turns a string array into a bool map
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
 */
export function snakify(value: string): string {
    if (value) {
        return XRegExp.replace(value.toLowerCase(), SNAKED_CHARS, '_', 'all');
    } else {
        return value;
    }
}
