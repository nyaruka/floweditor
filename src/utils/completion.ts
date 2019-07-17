import axios, { AxiosResponse } from 'axios';
import { reject } from 'core-js/fn/promise';
import { Endpoints } from 'flowTypes';
import { AssetMap, AssetStore, CompletionOption } from 'store/flowContext';

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

/**
 * Takes a dot query and returns the completions options at the current level
 * @param dotQuery query such as "results.field_name.ca"
 */
export const getCompletions = (
  schema: CompletionSchema,
  assetStore: AssetStore,
  dotQuery: string
): CompletionOption[] => {
  const parts = dotQuery.split('.');
  let currentProps: CompletionProperty[] = schema.root;

  let prefix = '';
  let part = '';
  while (parts.length > 0) {
    part = parts.shift();
    if (part) {
      // eslint-disable-next-line
      const nextProp = currentProps.find((prop: CompletionProperty) => prop.type === part);
      if (nextProp) {
        // eslint-disable-next-line
        const nextType = schema.types.find((type: CompletionType) => type.name === nextProp.type);
        if (nextType && nextType.properties) {
          currentProps = nextType.properties;
          prefix += part + '.';
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

export enum TopLevelVariables {
  child = 'child',
  contact = 'contact',
  fields = 'fields',
  input = 'input',
  parent = 'parent',
  results = 'results',
  run = 'run',
  trigger = 'trigger',
  urns = 'urns',
  webhook = 'webhook'
}

export const getCompletionName = (option: CompletionOption): string => {
  return option.name || option.signature.substr(0, option.signature.indexOf('('));
};

export const getCompletionSignature = (option: CompletionOption): string => {
  return option.signature.substr(option.signature.indexOf('('));
};

export const getFlowOptions = (accessor: string = ''): CompletionOption[] => {
  const prefix = accessor ? accessor : TopLevelVariables.run;
  return [
    {
      name: `${prefix}.flow`,
      summary: `The flow in which a ${accessor} run takes place`
    },
    {
      name: `${prefix}.flow.uuid`,
      summary: `The UUID of the flow in which a ${accessor} run takes place`
    },
    {
      name: `${prefix}.flow.name`,
      summary: `The name of the flow in which a ${accessor} run takes place`
    },
    {
      name: `${prefix}.flow.revision`,
      summary: `The revision number of the flow in which a ${accessor} run takes place`
    }
  ];
};

export const INPUT_OPTIONS: CompletionOption[] = [
  { name: 'input', summary: 'The most recent input' },
  { name: 'input.uuid', summary: 'The UUID of the last input' },
  { name: 'input.type', summary: 'The type of the last input' },
  {
    name: 'input.channel',
    summary: 'The channel the last input was received on'
  },
  {
    name: 'input.channel.address',
    summary: 'The channel the last input was received on'
  },
  {
    name: 'input.channel.name',
    summary: 'The name of the channel the last input was received on'
  },
  {
    name: 'input.channel.uuid',
    summary: 'The uuid of the channel the last input was received on'
  },
  {
    name: 'input.created_on',
    summary: 'The date of the last input'
  },
  {
    name: 'input.external_id',
    summary: 'The external id associated with the input'
  },
  {
    name: 'input.text',
    summary: 'The text from the last message'
  },
  {
    name: 'input.attachments',
    summary: 'The attachments from the last message'
  }
];

export const getContactOptions = (accessor?: string): CompletionOption[] => {
  const prefix = accessor ? `${accessor}.` : '';
  const descriptor = accessor
    ? accessor === TopLevelVariables.run
      ? `${accessor}'s`
      : `${accessor} run's`
    : '';
  return [
    {
      name: `${prefix}contact`,
      summary: `The name of the ${descriptor} contact`
    },
    {
      name: `${prefix}contact.first_name`,
      summary: `The first name of a ${descriptor} contact`
    },
    {
      name: `${prefix}contact.name`,
      summary: `The name of the ${descriptor} contact`
    },
    {
      name: `${prefix}contact.display`,
      summary: `The name or urn of the ${descriptor} contact`
    },
    {
      name: `${prefix}contact.fields`,
      summary: `Custom fields on a ${descriptor} contact`
    },
    {
      name: `${prefix}contact.urn`,
      summary: `The primary urn for a ${descriptor} contact`
    },
    {
      name: `${prefix}contact.language`,
      summary: `The language iso code for a ${descriptor} contact`
    },
    // {
    // name: `${prefix}contact.timezone`,
    // summary: `The timezone for a ${descriptor} contact`
    // },
    {
      name: `${prefix}contact.created_on`,
      summary: `The creation date for the ${descriptor} contact`
    },
    {
      name: `${prefix}contact.groups`,
      summary: `The groups a ${descriptor} contact is a member of`
    },
    {
      name: `${prefix}contact.urns`,
      summary: `The urns for a ${descriptor} contact`
    },
    {
      name: `${prefix}contact.uuid`,
      summary: `The uuid of the ${descriptor} contact`
    },
    {
      name: `${prefix}contact.channel`,
      summary: `A ${descriptor} contact's preferred channel`
    },
    {
      name: `${prefix}contact.channel.uuid`,
      summary: `The UUID of a ${descriptor} contact's preferred channel`
    },
    {
      name: `${prefix}contact.channel.name`,
      summary: `The name of a ${descriptor} contact's preferred channel`
    },
    {
      name: `${prefix}contact.channel.address`,
      summary: `The address of a ${descriptor} contact's preferred channel`
    }
  ];
};

export const RUN_OPTIONS: CompletionOption[] = [
  { name: TopLevelVariables.run, summary: 'A run in this flow' },
  ...getFlowOptions(),
  ...getContactOptions(TopLevelVariables.run)
];

export const CHILD_OPTIONS: CompletionOption[] = [
  {
    name: TopLevelVariables.child,
    summary: 'Run details collected in a child flow, if any'
  },
  ...getFlowOptions(TopLevelVariables.child),
  ...getContactOptions(TopLevelVariables.child)
];

export const PARENT_OPTIONS: CompletionOption[] = [
  {
    name: TopLevelVariables.parent,
    summary: 'Run details collected by a parent flow, if any'
  },
  ...getFlowOptions(TopLevelVariables.parent),
  ...getContactOptions(TopLevelVariables.parent)
];

export const TRIGGER_OPTIONS: CompletionOption[] = [
  { name: 'trigger', summary: 'A trigger that initiated a session' },
  {
    name: 'trigger.type',
    summary: 'The type of a trigger, one of “manual” or “flow”'
  },
  { name: 'trigger.params', summary: 'The parameters passed to a trigger' }
];

export const URN_OPTIONS: CompletionOption[] = [
  { name: 'urns', summary: 'The urns for the contact' },
  { name: 'urns.facebook', summary: 'The Facebook urn for the contact' },
  {
    name: 'urns.fcm',
    summary: 'The Firebase Cloud Messaging id for the contact'
  },
  { name: 'urns.jiochat', summary: 'The Jiochat id for the contact' },
  { name: 'urns.line', summary: 'The Line id for the contact' },
  { name: 'urns.mailto', summary: 'The email address for the contact' },
  { name: 'urns.tel', summary: 'The phone number for the contact' },
  { name: 'urns.telegram', summary: 'The Telegram id for the contact' },
  { name: 'urns.twitterid', summary: 'The Twitter id for the contact' },
  { name: 'urns.viber', summary: 'The Viber id for the contact' },
  { name: 'urns.wechat', summary: 'The Wechat id for the contact' },
  { name: 'urns.whatsapp', summary: 'The WhatsApp number for the contact' }
];

export const COMPLETION_VARIABLES: CompletionOption[] = [
  ...getContactOptions(),
  { name: 'results', summary: 'The results for the current run' },
  { name: 'fields', summary: 'The custom fields for the contact' },
  ...INPUT_OPTIONS,
  ...URN_OPTIONS,
  ...RUN_OPTIONS,
  ...CHILD_OPTIONS,
  ...PARENT_OPTIONS,
  { name: 'webhook', summary: 'The parsed JSON payload of the last webhook call' },
  ...TRIGGER_OPTIONS
];

export const TOP_LEVEL_OPTIONS = COMPLETION_VARIABLES.filter((option: CompletionOption) => {
  const name = getCompletionName(option);
  return (
    name === TopLevelVariables.child ||
    name === TopLevelVariables.contact ||
    name === TopLevelVariables.fields ||
    name === TopLevelVariables.input ||
    name === TopLevelVariables.parent ||
    name === TopLevelVariables.results ||
    name === TopLevelVariables.run ||
    name === TopLevelVariables.trigger ||
    name === TopLevelVariables.urns ||
    name === TopLevelVariables.webhook
  );
});

export const filterOptions = (
  options: CompletionOption[],
  query: string = '',
  includeFunctions: boolean
): CompletionOption[] => {
  const search = query.toLowerCase();
  return options.filter((option: CompletionOption) => {
    if (includeFunctions) {
      if (option.signature) {
        return option.signature.indexOf(search) === 0;
      }
    }

    if (option.name) {
      const rest = option.name.substr(search.length);
      return (
        option.name.indexOf(search) === 0 &&
        (rest.length === 0 || rest.substr(1).indexOf('.') === -1)
      );
    }
    return false;
  });
};

export const getResultPropertyOptions = (accessor: string, name: string) => [
  {
    name: accessor,
    description: `Result for "${name}"`
  },
  {
    name: `${accessor}.value`,
    description: `Value for "${name}"`
  },
  {
    name: `${accessor}.category`,
    description: `Category for "${name}"`
  },
  {
    name: `${accessor}.category_localized`,
    description: `Localized category for "${name}"`
  },
  {
    name: `${accessor}.input`,
    description: `Input for "${name}"`
  },
  {
    name: `${accessor}.created_on`,
    description: `Time "${name}" was created`
  }
];

/* export const getResultOptions = (results: ResultMap) =>
  [...new Set(Object.keys(results).map(uuid => results[uuid]))].reduce((options, query) => {
      const accessor = query.replace(/^@/, '');
      const name = titleCase(accessor.slice(accessor.lastIndexOf('.') + 1).replace(/_/g, ' '));
      options.push(...getResultPropertyOptions(accessor, name));
      return options;
  }, []);
*/

export const getContactFieldOptions = (assets: AssetMap) =>
  Object.keys(assets).reduce((options, key) => {
    const { [key]: asset } = assets;
    options.push({
      name: `fields.${key}`,
      summary: `${asset.name} for the contact.`
    });

    const accessors = ['', 'parent.', 'run.', 'child.'];
    accessors.forEach((accessor: string) =>
      options.push({
        name: `${accessor}contact.fields.${key}`,
        summary: `${asset.name} for the contact.`
      })
    );
    return options;
  }, []);

export const getResultsOptions = (assets: AssetMap) =>
  Object.keys(assets).reduce((options, key) => {
    const { [key]: asset } = assets;

    return options.concat([
      // @results
      {
        name: `results.${key}`,
        summary: `${asset.name} value for the run.`
      },
      {
        name: `results.${key}.value`,
        summary: `${asset.name} value for the run.`
      },
      {
        name: `results.${key}.category`,
        summary: `${asset.name} category for the run.`
      },
      {
        name: `results.${key}.category_localized`,
        summary: `${asset.name} localized category for the run.`
      },
      {
        name: `results.${key}.name`,
        summary: `${asset.name} localized category for the run.`
      },
      {
        name: `results.${key}.node_uuid`,
        summary: 'The uuid for the node that created this result.'
      },
      {
        name: `results.${key}.input`,
        summary: 'The input at the time this result was created.'
      },
      {
        name: `results.${key}.created_on`,
        summary: `${asset.name} localized category for the run.`
      },

      // @run.results
      {
        name: 'run.results',
        summary: 'Results for the run.'
      },
      {
        name: `run.results.${key}`,
        summary: `${asset.name} value for the run.`
      },
      {
        name: `run.results.${key}.category`,
        summary: `${asset.name} category for the run.`
      },
      {
        name: `run.results.${key}.category_localized`,
        summary: `${asset.name} localized category for the run.`
      },
      {
        name: `run.results.${key}.node_uuid`,
        summary: 'The uuid for the node that created this result.'
      },
      {
        name: `run.results.${key}.input`,
        summary: 'The input at the time this result was created.'
      },
      {
        name: `results.${key}.extra`,
        summary: `${asset.name} extra data for this result, such as a webhook response.`
      },
      {
        name: `run.results.${key}.created_on`,
        summary: `${asset.name} localized category for the run.`
      }
    ]);
  }, []);

let COMPLETIONS_WITH_FUNCTIONS: CompletionOption[] = COMPLETION_VARIABLES;

export const setFunctions = (functions: CompletionOption[]) => {
  COMPLETIONS_WITH_FUNCTIONS = COMPLETION_VARIABLES.concat(functions);
};

export const fetchFunctions = (endpoints: Endpoints) => {
  axios
    .get(endpoints.functions)
    .then((response: AxiosResponse) => {
      setFunctions(response.data as CompletionOption[]);
    })
    .catch(error => reject(error));
};

export const getCompletionOptions = (
  autocomplete: boolean,
  assets: AssetStore,
  functions: boolean = true
): CompletionOption[] => {
  const options = functions ? COMPLETIONS_WITH_FUNCTIONS : COMPLETION_VARIABLES;
  return autocomplete
    ? [
        ...options,
        ...getContactFieldOptions(assets.fields ? assets.fields.items : {}),
        ...getResultsOptions(assets.results ? assets.results.items : {})
      ]
    : options;
};
