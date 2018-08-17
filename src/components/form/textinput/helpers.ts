import { split } from 'split-sms';
import { GSM, OPTIONS } from '~/components/form/textinput/constants';
import { CompletionOption, ContactFields, Result, ResultMap } from '~/store/flowContext';

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

// Courtesy of @diegoperini: https://gist.github.com/dperini/729294
// Expected behavior: https://mathiasbynens.be/demo/url-regex
/* istanbul ignore next */
export const isValidURL = (str: string): boolean => {
    const webURLRegex = new RegExp(
        '^' +
            // protocol identifier
            '(?:(?:https?|ftp)://)' +
            // user:pass authentication
            '(?:\\S+(?:u:\\S*)?@)?' +
            '(?:' +
            // IP address exclusion
            // private & local networks
            '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
            '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
            '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)
            '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
            '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
            '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
            '|' +
            // host name
            '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
            // domain name
            '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
            // TLD identifier
            '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
            // TLD may end with dot
            '\\.?' +
            ')' +
            // port number
            '(?::\\d{2,5})?' +
            // resource path
            '(?:[/?#]\\S*)?' +
            '$',
        'i'
    );

    return webURLRegex.test(str);
};

export const filterOptions = (
    options: CompletionOption[],
    query: string = ''
): CompletionOption[] => {
    const search = query.toLowerCase();
    return options.filter(({ name: optionName }: CompletionOption) => {
        const rest = optionName.substr(search.length);
        return (
            optionName.indexOf(search) === 0 &&
            (rest.length === 0 || rest.substr(1).indexOf('.') === -1)
        );
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
        name: `${accessor}.node_uuid`,
        description: `Node UUID for "${name}"`
    },
    {
        name: `${accessor}.created_on`,
        description: `Time "${name}" was created`
    }
];

export const getResultOptions = (results: ResultMap) =>
    [...new Set(Object.keys(results).map(uuid => results[uuid]))].reduce(
        (options, result: Result) => {
            options.push(...getResultPropertyOptions(`run.results.${result.key}`, result.name));
            return options;
        },
        []
    );

export const getContactFieldOptions = (contactFields: ContactFields) =>
    Object.keys(contactFields).reduce((contactFieldCompletionOptions, key) => {
        const { [key]: name } = contactFields;
        const accessors = ['', 'parent.', 'run.', 'child.'];
        accessors.forEach(accessor =>
            contactFieldCompletionOptions.push({
                name: `${accessor}contact.fields.${key}`,
                description: `The value held in a contact's "${name}" field`
            })
        );
        return contactFieldCompletionOptions;
    }, []);

export const getOptionsList = (
    autocomplete: boolean,
    results: ResultMap = {},
    contactFields: ContactFields = {}
): CompletionOption[] =>
    autocomplete
        ? [...OPTIONS, ...getResultOptions(results), ...getContactFieldOptions(contactFields)]
        : OPTIONS;

export const pluralize = (count: number, noun: string, suffix: string = 's'): string =>
    `${noun}${count !== 1 ? suffix : ''}`;
