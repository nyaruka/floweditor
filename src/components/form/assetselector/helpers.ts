import { Asset } from '~/store/flowContext';

/**
 * Sorts all search results by name
 */
export const sortByName = (a: Asset, b: Asset): number => {
    return a.name.localeCompare(b.name);
};
