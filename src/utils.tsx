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