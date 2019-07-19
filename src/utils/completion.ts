import { AssetStore, CompletionOption } from 'store/flowContext';

export interface CompletionAssets {
  assetStore: AssetStore;
  schema: CompletionSchema;
}

export interface CompletionProperty {
  key: string;
  help: string;
  type: string;
}

export interface CompletionType {
  name: string;

  key_source?: string;
  property_template?: CompletionProperty;
  properties?: CompletionProperty[];
}

export interface CompletionSchema {
  types: CompletionType[];
  root: CompletionProperty[];
}

export const getFunctions = (functions: CompletionOption[], query: string): CompletionOption[] => {
  return functions.filter((option: CompletionOption) => {
    if (option.signature) {
      return option.signature.indexOf(query) === 0;
    }
    return false;
  });
};

/**
 * Takes a dot query and returns the completions options at the current level
 * @param dotQuery query such as "results.field_name.ca"
 */
export const getCompletions = (
  completion: CompletionAssets,
  dotQuery: string
): CompletionOption[] => {
  const parts = (dotQuery || '').split('.');
  let currentProps: CompletionProperty[] = completion.schema.root;

  let prefix = '';
  let part = '';
  while (parts.length > 0) {
    part = parts.shift();
    if (part) {
      // eslint-disable-next-line
      const nextProp = currentProps.find((prop: CompletionProperty) => prop.key === part);
      if (nextProp) {
        // eslint-disable-next-line
        const nextType = completion.schema.types.find(
          (type: CompletionType) => type.name === nextProp.type
        );
        if (nextType && nextType.properties) {
          currentProps = nextType.properties;
          prefix += part + '.';
        } else if (nextType && nextType.property_template) {
          prefix += part + '.';
          const template = nextType.property_template;
          currentProps = Object.keys(completion.assetStore[nextType.name].items).map(
            (key: string) => ({
              key: template.key.replace('{key}', key),
              help: template.help.replace('{key}', key),
              type: template.type
            })
          );
        } else {
          // eslint-disable-next-line
          currentProps = currentProps.filter((prop: CompletionProperty) =>
            prop.key.startsWith(part.toLowerCase())
          );
          break;
        }
      } else {
        // eslint-disable-next-line
        currentProps = currentProps.filter((prop: CompletionProperty) =>
          prop.key.startsWith(part.toLowerCase())
        );
        break;
      }
    }
  }

  return currentProps.map((prop: CompletionProperty) => {
    const name =
      prop.key === '__default__' ? prefix.substr(0, prefix.length - 1) : prefix + prop.key;
    return { name, summary: prop.help };
  });
};

export const getCompletionName = (option: CompletionOption): string => {
  return option.name || option.signature.substr(0, option.signature.indexOf('('));
};

export const getCompletionSignature = (option: CompletionOption): string => {
  return option.signature.substr(option.signature.indexOf('('));
};
