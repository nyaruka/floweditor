/** Turns a string array into a bool map */
export function toBoolMap(array: string[]): {[item: string]: boolean} {
    var map: {[item: string]: boolean} = {};
    for (let item of array) {
        map[item] = true;
    }
    return map;
}