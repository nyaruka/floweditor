import { isValidURL } from '~/components/form/textinput/helpers';
import { Asset } from '~/services/AssetService';
import { FormEntry, ValidationFailure } from '~/store/nodeEditor';

export type FormInput = string | string[] | number | Asset | Asset[];
export type ValidatorFunc = (name: string, input: FormInput) => ValidationFailure[];

// TODO: should not depend on components/..

export const validate = (
    name: string,
    input: FormInput,
    validators: ValidatorFunc[]
): FormEntry => {
    let failures: ValidationFailure[] = [];
    validators.forEach(validateFunc => {
        failures = failures.concat(validateFunc(name, input));
    });

    const formEntry: FormEntry = { value: input };
    if (failures.length > 0) {
        formEntry.validationFailures = failures;
    }

    return formEntry;
};

export const validateRequired: ValidatorFunc = (name: string, input: FormInput) => {
    if (!input) {
        return [{ message: `${name} is required` }];
    }

    if (typeof input === 'string') {
        if ((input as string).trim().length === 0) {
            return [{ message: `${name} is required` }];
        }
    } else if (Array.isArray(input)) {
        if (input.length === 0) {
            return [{ message: `${name} are required` }];
        }
    }
    return [];
};

export const validateURL: ValidatorFunc = (name: string, input: FormInput) => {
    if (typeof input === 'string') {
        if (isValidURL(input as string)) {
            return [{ message: `${name} is not a valid URL` }];
        }
    }
    return [];
};

const validateMax = (max: number): ValidatorFunc => (name: string, input: FormInput) => {
    if (Array.isArray(input)) {
        const items = input as string[];
        if (items.length > max) {
            return [{ message: `${name} cannot have more than ${max} entries` }];
        }
    }
    return [];
};

export const validateMaxOfTen = validateMax(10);
