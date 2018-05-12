import { FormEntry, ValidationFailure } from './nodeEditor';

type FormInput = string | string[] | number;
type ValidatorFunc = (name: string, input: FormInput) => ValidationFailure[];

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
    if (typeof input === 'string') {
        if ((input as string).trim().length === 0) {
            return [{ message: `${name} is required` }];
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
