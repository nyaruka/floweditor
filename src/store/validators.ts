import { Asset } from '~/store/flowContext';
import { FormEntry, ValidationFailure } from '~/store/nodeEditor';

export type FormInput = string | string[] | number | Asset | Asset[];
export type ValidatorFunc = (
    name: string,
    input: FormInput
) => { failures: ValidationFailure[]; value: FormInput };

// TODO: should not depend on components/..

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

export const validate = (
    name: string,
    input: FormInput,
    validators: ValidatorFunc[]
): FormEntry => {
    let allFailures: ValidationFailure[] = [];
    let value = input;
    validators.forEach(validateFunc => {
        const validation = validateFunc(name, input);
        value = validation.value;
        allFailures = allFailures.concat(validation.failures);
    });

    return { value, validationFailures: allFailures };
};

export const validateRequired: ValidatorFunc = (name: string, input: FormInput) => {
    if (!input) {
        return { value: input, failures: [{ message: `${name} is required` }] };
    }

    if (typeof input === 'string') {
        if ((input as string).trim().length === 0) {
            return { value: input, failures: [{ message: `${name} is required` }] };
        }
    } else if (Array.isArray(input)) {
        if (input.length === 0) {
            return { value: input, failures: [{ message: `${name} are required` }] };
        }
    }
    return { failures: [], value: input };
};

export const validateURL: ValidatorFunc = (name: string, input: FormInput) => {
    if (typeof input === 'string') {
        // don't validate empty strings, that's up to validate required
        if ((input as string).trim() === '') {
            return { value: input, failures: [] };
        }

        if (!isValidURL(input as string)) {
            return { value: input, failures: [{ message: `${name} is not a valid URL` }] };
        }
    }
    return { failures: [], value: input };
};

export const validateNumeric: ValidatorFunc = (name: string, input: FormInput) => {
    if (typeof input === 'string') {
        const inputString = input as string;

        if (inputString.trim().startsWith('@')) {
            return { failures: [], value: input };
        }

        if (isNaN(Number(inputString))) {
            return {
                value: input,
                failures: [{ message: `${name} must be a number` }]
            };
        }

        return { failures: [], value: input };
    }
    return { failures: [], value: input };
};

export const validateLessThan = (amount: number, checkName: string): ValidatorFunc => (
    name: string,
    input: FormInput
) => {
    if (typeof input === 'string') {
        if (parseFloat(input as string) >= amount) {
            return {
                value: input,
                failures: [{ message: `${name} must be a less than ${checkName}` }]
            };
        }

        return { failures: [], value: input };
    }
    return { failures: [], value: input };
};

export const validateMoreThan = (amount: number, checkName: string): ValidatorFunc => (
    name: string,
    input: FormInput
) => {
    if (typeof input === 'string') {
        if (parseFloat(input as string) <= amount) {
            return {
                value: input,
                failures: [{ message: `${name} must be a more than ${checkName}` }]
            };
        }

        return { failures: [], value: input };
    }
    return { failures: [], value: input };
};

const validateMax = (max: number): ValidatorFunc => (name: string, input: FormInput) => {
    if (Array.isArray(input)) {
        const items = input as string[];
        if (items.length > max) {
            return {
                value: input,
                failures: [{ message: `${name} cannot have more than ${max} entries` }]
            };
        }
    }
    return { failures: [], value: input };
};

export const validateMaxOfTen = validateMax(10);
