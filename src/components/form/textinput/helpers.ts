import { split } from 'split-sms';
import { GSM, OPTIONS } from '~/components/form/textinput/constants';
import { AssetMap, AssetStore, CompletionOption } from '~/store/flowContext';

export interface UnicodeCharMap {
    [char: string]: boolean;
}

interface MsgStats {
    value: string;
    parts: string[];
    characterCount: number;
    unicodeChars: UnicodeCharMap;
}

export const isUnicode = (char: string): boolean => {
    if (GSM.hasOwnProperty(char)) {
        return false;
    }
    return true;
};

export const getUnicodeChars = (msg: string): UnicodeCharMap => {
    const chars = {};

    for (const char of msg) {
        if (isUnicode(char)) {
            chars[char] = true;
        }
    }

    return chars;
};

/**
 * Replaces unicode characters commonly inserted by text editors like MSWord with their GSM equivalents
 * @param {string} msg - msg to be cleaned
 * @returns {string} Cleaned msg
 */
export const cleanMsg = (msg: string): string =>
    msg
        .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
        .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
        .replace(/[\u2013\u2014]/g, '-') // En/em dash
        .replace(/\u2026/g, '...') // Horizontal ellipsis
        .replace(/\u2002/g, ' '); // En space

/**
 * First pass at providing the user with an accurate character count for their SMS messages.
 * Determines encoding, segments, max character limit per message and calculates character count.
 * Optionally replaces common unicode 'gotcha characters' with their GSM counterparts.
 * @param value
 * @param replace
 */
export const getMsgStats = (value: string | string[], replace?: boolean): MsgStats => {
    let newVal = value as string;

    // Localized values are stored as string arrays
    if (newVal.constructor === Array) {
        newVal = newVal[0];
    }

    if (replace) {
        newVal = cleanMsg(newVal);
    }

    const stats = split(newVal);

    return {
        value: newVal,
        parts: stats.parts,
        characterCount: stats.length,
        unicodeChars: getUnicodeChars(newVal)
    };
};

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

export const getOptionsList = (autocomplete: boolean, assets: AssetStore): CompletionOption[] => {
    return autocomplete
        ? [
              ...OPTIONS,
              ...getContactFieldOptions(assets.fields ? assets.fields.items : {}),
              ...getResultsOptions(assets.results ? assets.results.items : {})
          ]
        : OPTIONS;
};

export const pluralize = (count: number, noun: string, suffix: string = 's'): string =>
    `${noun}${count !== 1 ? suffix : ''}`;
