import { Translation } from './TranslatorTab';
import { Type } from 'config/interfaces';
import { desnake } from 'utils';
import i18next from 'i18next';

export const needsTranslating = (translation: Translation) => {
  return !translation.to;
};

export const findTranslations = (
  typeConfig: Type,
  localizable: any,
  localization: { [uuid: string]: any },
  node_uuid: string,
  action_uuid?: string
): Translation[] => {
  const translations: Translation[] = [];
  if ((typeConfig.localizeableKeys || []).length > 0) {
    typeConfig.localizeableKeys.forEach((attribute: string) => {
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
            typeConfig,
            attribute,
            from,
            to,
            node_uuid,
            action_uuid
          });
        }
      }
    });
  }
  return translations;
};

export const getFriendlyAttribute = (attribute: string) => {
  if (attribute === 'categories') {
    return i18next.t('translation.attributes.categories', 'Categories');
  }

  if (attribute === 'text') {
    return i18next.t('translation.attributes.text', 'Text');
  }

  if (attribute === 'quick_replies') {
    return i18next.t('translation.attributes.quick_relpies', 'Quick Replies');
  }

  if (attribute === 'cases') {
    return i18next.t('translation.attributes.cases', 'Rules');
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
