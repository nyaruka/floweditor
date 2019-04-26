import { AssetMap, AssetStore, CompletionOption } from '~/store/flowContext';

import * as xlnt from './functions.json';

export enum TopLevelVariables {
    contact = 'contact',
    input = 'input',
    results = 'results',
    run = 'run',
    parent = 'parent',
    child = 'child',
    trigger = 'trigger',
    fields = 'fields'
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
        { name: `${prefix}.flow`, summary: `The flow in which a ${accessor} run takes place` },
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

export const getWebhookOptions = (accessor: string = ''): CompletionOption[] => {
    const prefix = accessor ? accessor : TopLevelVariables.run;
    return [
        {
            name: `${prefix}.webhook`,
            summary: `The body of the response to the last webhook request made in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.status`,
            summary: `The status of the last webhook request made in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.status_code`,
            summary: `The status code returned from the last webhook request made in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.url`,
            summary: `The URL that was called by the last webhook request in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.body`,
            summary: `The body of the last webhook request made in a ${accessor} run`
        },
        {
            name: `${prefix}.webhook.json`,
            summary: `The JSON parsed body of the response to the last webhook request in a ${accessor} run, can access subelements`
        },
        {
            name: `${prefix}.webhook.request`,
            summary: `The raw request last made in a ${accessor} run, including headers`
        },
        {
            name: `${prefix}.webhook.response`,
            summary: `The raw response last received in a ${accessor} run, including headers`
        },
        { name: `${prefix}.results`, summary: `Results collected in a ${accessor} run` }
    ];
};

export const getInputOptions = (accessor: string = ''): CompletionOption[] => {
    const prefix = accessor ? accessor : TopLevelVariables.run;
    return [
        { name: `${prefix}.input`, summary: `A ${accessor} run's last input` },
        { name: `${prefix}.input.uuid`, summary: `The UUID of a ${accessor} run's last input` },
        { name: `${prefix}.input.type`, summary: `The type of a ${accessor} run's last input` },
        {
            name: `${prefix}.input.channel`,
            summary: `The channel a ${accessor} run's last input was received on`
        },
        {
            name: `${prefix}.input.created_on`,
            summary: `The time a ${accessor} run's last input was created`
        },
        {
            name: `${prefix}.input.text`,
            summary: `The text of a ${accessor} run's last message`
        },
        {
            name: `${prefix}.input.attachments`,
            summary: `The attachments on a ${accessor} run's last message`
        },
        {
            name: `${prefix}.input.urn`,
            summary: `The URN a ${accessor} run's last input was received on`
        }
    ];
};

export const getContactOptions = (accessor?: string): CompletionOption[] => {
    const prefix = accessor ? `${accessor}.` : '';
    const descriptor = accessor
        ? accessor === TopLevelVariables.run
            ? `${accessor}'s`
            : `${accessor} run's`
        : '';
    return [
        { name: `${prefix}contact`, summary: `The name of a ${descriptor} contact` },
        { name: `${prefix}contact.uuid`, summary: `The uuid of a ${descriptor} contact` },
        { name: `${prefix}contact.name`, summary: `The name of a ${descriptor} contact` },
        {
            name: `${prefix}contact.first_name`,
            summary: `The first name of a ${descriptor} contact`
        },
        {
            name: `${prefix}contact.language`,
            summary: `The language code for a ${descriptor} contact`
        },
        {
            name: `${prefix}contact.fields`,
            summary: `Custom fields on a ${descriptor} contact`
        },
        {
            name: `${prefix}contact.groups`,
            summary: `The groups a ${descriptor} contact is a member of`
        },
        { name: `${prefix}contact.urns`, summary: `URNs on a ${descriptor} contact` },
        {
            name: `${prefix}contact.urns.tel`,
            summary: `The preferred telephone number for a ${descriptor} contact`
        },
        {
            name: `${prefix}contact.urns.telegram`,
            summary: `The preferred telegram id for a ${descriptor} contact`
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
    ...getContactOptions(TopLevelVariables.run),
    ...getInputOptions(),
    ...getWebhookOptions()
];

export const CHILD_OPTIONS: CompletionOption[] = [
    { name: TopLevelVariables.child, summary: 'Run details collected in a child flow, if any' },
    ...getFlowOptions(TopLevelVariables.child),
    ...getContactOptions(TopLevelVariables.child),
    ...getInputOptions(TopLevelVariables.child),
    ...getWebhookOptions(TopLevelVariables.child)
];

export const PARENT_OPTIONS: CompletionOption[] = [
    {
        name: TopLevelVariables.parent,
        summary: 'Run details collected by a parent flow, if any'
    },
    ...getFlowOptions(TopLevelVariables.parent),
    ...getContactOptions(TopLevelVariables.parent),
    ...getInputOptions(TopLevelVariables.parent),
    ...getWebhookOptions(TopLevelVariables.parent)
];

export const TRIGGER_OPTIONS: CompletionOption[] = [
    { name: 'trigger', summary: 'A trigger that initiated a session' },
    { name: 'trigger.type', summary: 'The type of a trigger, one of “manual” or “flow”' },
    { name: 'trigger.params', summary: 'The parameters passed to a trigger' }
];

export const COMPLETION_VARIABLES: CompletionOption[] = [
    ...getContactOptions(),
    { name: 'results', summary: 'The results for the current run' },
    { name: 'fields', summary: 'The custom fields for the contact' },
    ...RUN_OPTIONS,
    ...CHILD_OPTIONS,
    ...PARENT_OPTIONS,
    ...TRIGGER_OPTIONS
];

export const COMPLETION_OPTIONS: CompletionOption[] = [...COMPLETION_VARIABLES, ...xlnt];

export const TOP_LEVEL_OPTIONS = COMPLETION_OPTIONS.filter((option: CompletionOption) => {
    const name = getCompletionName(option);
    return (
        name === TopLevelVariables.contact ||
        name === TopLevelVariables.input ||
        name === TopLevelVariables.results ||
        name === TopLevelVariables.run ||
        name === TopLevelVariables.parent ||
        name === TopLevelVariables.child ||
        name === TopLevelVariables.trigger ||
        name === TopLevelVariables.fields
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
        accessors.forEach(accessor =>
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
        const accessors = ['results', 'run.results'];
        accessors.forEach(accessor => {
            options.push({
                name: `${accessor}.${key}`,
                summary: `${asset.name} for the run.`
            });

            options.push({
                name: `${accessor}.${key}.category`,
                summary: `${asset.name} category for the run.`
            });

            options.push({
                name: `${accessor}.${key}.category_localized`,
                summary: `${asset.name} localized category for the run.`
            });
        });

        return options;
    }, []);

export const getCompletionOptions = (
    autocomplete: boolean,
    assets: AssetStore,
    functions: boolean = true
): CompletionOption[] => {
    const options = functions ? COMPLETION_OPTIONS : COMPLETION_VARIABLES;
    return autocomplete
        ? [
              ...options,
              ...getContactFieldOptions(assets.fields ? assets.fields.items : {}),
              ...getResultsOptions(assets.results ? assets.results.items : {})
          ]
        : options;
};
