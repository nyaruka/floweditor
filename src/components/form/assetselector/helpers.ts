import { Template } from 'flowTypes';
import { Asset } from 'store/flowContext';

/**
 * Sorts all search results by name
 */
export const sortByName = (a: Asset, b: Asset): number => {
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
