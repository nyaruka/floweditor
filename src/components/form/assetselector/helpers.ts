import { Template } from 'flowTypes';
import { Asset, REMOVE_VALUE_ASSET } from 'store/flowContext';

/**
 * Sorts all search results by name
 */
export const sortByName = (a: Asset, b: Asset): number => {
  if (a.type === REMOVE_VALUE_ASSET.type) {
    return -1;
  }

  if (b.type === REMOVE_VALUE_ASSET.type) {
    return 1;
  }

  if (a.type && b.type && a.type !== b.type) {
    return b.type.localeCompare(a.type);
  }

  if (a.name && b.name) {
    return a.name.localeCompare(b.name);
  }
  return 0;
};

export const hasPendingTranslation = (template: Template) => {
  return !!template.translations.find(translation => translation.status === 'pending');
};

export const hasUseableTranslation = (template: Template) => {
  return !!template.translations.find(
    translation => translation.status === 'pending' || translation.status === 'approved'
  );
};
