import { desnake } from 'utils';
import i18next from 'i18next';
import { Translation, TranslationType, TranslationBundle } from './TranslatorTab';

export enum TranslationState {
  COMPLETE = 'complete',
  MISSING = 'missing'
}

export const getMergedByType = (
  bundle: TranslationBundle,
  state: TranslationState,
  type: TranslationType
) => {
  return bundle.translations
    .filter(translation => {
      switch (state) {
        case TranslationState.COMPLETE:
          return !!translation.to && translation.type === type;
        case TranslationState.MISSING:
          return !translation.to && translation.type === type;
      }
      return true;
    })
    .map(translation => (translation as any)[state === TranslationState.MISSING ? 'from' : 'to'])
    .join(', ');
};

export const findTranslations = (
  type: TranslationType,
  localizeableKeys: string[],
  localizable: any,
  localization: { [uuid: string]: any }
): Translation[] => {
  const translations: Translation[] = [];

  localizeableKeys.forEach((attribute: string) => {
    let keys = attribute.split('.');
    let from = localizable as any;
    let to: any = [];

    while (keys.length > 0 && from) {
      if (keys.length > 0 && from['uuid']) {
        to = (localization || {})[from['uuid']];
      }

      const path = keys.shift();
      if (to) {
        to = to[path];
      }
      from = from[path];
    }

    if (from) {
      if (to) {
        to = to.join(', ');
      }

      if (Array.isArray(from)) {
        from = from
          .map((obj: any) => {
            if (obj['name']) {
              return obj['name'];
            }
            if (obj['arguments']) {
              return obj['arguments'].join(' ');
            }
            return obj;
          })
          .join(', ');
      }

      if (from) {
        translations.push({
          type,
          attribute,
          from,
          to
        });
      }
    }
  });

  return translations;
};

export const getFriendlyAttribute = (attribute: string) => {
  if (attribute === 'categories') {
    return i18next.t('translation.attributes.categories', 'Categories');
  }

  if (attribute === 'cases') {
    return i18next.t('translation.attributes.cases', 'Rules');
  }

  if (attribute === 'text') {
    return i18next.t('translation.attributes.text', 'Message');
  }

  if (attribute === 'quick_replies') {
    return i18next.t('translation.attributes.quick_replies', 'Quick Replies');
  }

  if (attribute === 'templating.variables') {
    return i18next.t('translation.attributes.templates', 'Template Variables');
  }

  if (attribute === 'subject') {
    return i18next.t('translation.attributes.subject', 'Subject');
  }

  if (attribute === 'body') {
    return i18next.t('translation.attributes.body', 'Body');
  }

  return desnake(attribute);
};

export const getBundleKey = (bundle: TranslationBundle) => {
  return bundle.node_uuid + bundle.action_uuid;
};
