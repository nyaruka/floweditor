import { Asset, AssetMap } from '~/store/flowContext';

/**
 * Sorts all search results by name
 */
export const sortByName = (a: Asset, b: Asset): number => {
    if (a.type !== b.type) {
        return b.type.localeCompare(a.type);
    }
    return a.name.localeCompare(b.name);
};

export const isMatch = (input: string, asset: Asset, exclude: string[]): boolean => {
    if ((exclude || []).find((id: string) => asset.id === id)) {
        return false;
    }
    return asset.name.toLowerCase().includes(input);
};

export const searchAssets = (
    input: string,
    assets: AssetMap,
    additionalOptions?: Asset[],
    excludeOptions?: string[]
): Asset[] => {
    const search = input.toLowerCase();
    let matches = Object.keys(assets)
        .map(key => assets[key])
        .filter((asset: Asset) => isMatch(search, asset, excludeOptions));

    // include our additional matches if we have any
    matches = matches
        .concat(additionalOptions || [])
        .filter((asset: Asset) => isMatch(search, asset, excludeOptions));

    return matches;
};
