import * as headerUtils from 'http-headers-validation';
import { Asset } from 'store/flowContext';
import { FormEntry, ValidationFailure } from 'store/nodeEditor';
import { SelectOption } from 'components/form/select/SelectElement';
import i18n from 'config/i18n';

export type FormInput =
  | string
  | string[]
  | number
  | Asset
  | Asset[]
  | SelectOption
  | SelectOption[];
export type ValidatorFunc = (
  name: string,
  input: FormInput
) => { failures: ValidationFailure[]; value: FormInput };

// Courtesy of @diegoperini: https://gist.github.com/dperini/729294
// Expected behavior: https://mathiasbynens.be/demo/url-regex
const REGEX_URL = new RegExp(
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

const inputAsString = (input: FormInput): string => {
  let value = input;
  if (typeof input === 'string') {
    return value + '';
  }

  // if we are an object consider the name to match assets
  if (input && typeof input === 'object') {
    value = (input as any).name || undefined;
  }

  return value ? value + '' : null;
};

const fromMaxItems = (max: number): ValidatorFunc => (name: string, input: FormInput) => {
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

const fromRegex = (regex: RegExp, message: string): ValidatorFunc => (
  name: string,
  input: FormInput
) => {
  const value = inputAsString(input);
  if (value) {
    if (!regex.test(value)) {
      return {
        value: input,
        failures: [{ message: `${name} ${message}` }]
      };
    }
  }
  return { failures: [], value: input };
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

export const Empty: ValidatorFunc = (name: string, input: FormInput) => {
  const isNotFinished = i18n.t('forms.is_not_finished', 'is not finished');

  if (input) {
    return { value: input, failures: [{ message: `${name} ${isNotFinished}` }] };
  }

  if (typeof input === 'string') {
    if ((input as string).trim().length !== 0) {
      return {
        value: input,
        failures: [{ message: `${name} ${isNotFinished}` }]
      };
    }
  } else if (Array.isArray(input)) {
    if (input.length !== 0) {
      return {
        value: input,
        failures: [{ message: `${name} ${isNotFinished}` }]
      };
    }
  }
  return { failures: [], value: input };
};

export const Required: ValidatorFunc = (name: string, input: FormInput) => {
  const isRequired = i18n.t('forms.is_required', 'is required');

  if (!input) {
    return { value: input, failures: [{ message: `${name} ${isRequired}` }] };
  }

  if (typeof input === 'string') {
    if ((input as string).trim().length === 0) {
      return { value: input, failures: [{ message: `${name} ${isRequired}` }] };
    }
  } else if (Array.isArray(input)) {
    if (input.length === 0) {
      return {
        value: input,
        failures: [{ message: `${name} ${i18n.t('forms.are_required', 'are required')}` }]
      };
    }
  }
  return { failures: [], value: input };
};

export const Regex: ValidatorFunc = (name: string, input: FormInput) => {
  if (typeof input === 'string') {
    const inputString = input as string;

    if (inputString.trim().startsWith('@')) {
      return { failures: [], value: input };
    }

    try {
      // tslint:disable-next-line:no-unused-expression
      new RegExp(inputString);
    } catch (e) {
      return {
        value: input,
        failures: [
          {
            message: `${name} ${i18n.t('forms.is_not_a_valid_regex', 'is not a valid regex')}`
          }
        ]
      };
    }
  }

  return { failures: [], value: input };
};

export const LessThan = (amount: number, checkName: string): ValidatorFunc => (
  name: string,
  input: FormInput
) => {
  if (typeof input === 'string') {
    if (parseFloat(input as string) >= amount) {
      return {
        value: input,
        failures: [
          {
            message: `${name} ${i18n.t(
              'forms.must_be_less_than',
              'must be less than'
            )} ${checkName}`
          }
        ]
      };
    }

    return { failures: [], value: input };
  }
  return { failures: [], value: input };
};

export const MoreThan = (amount: number, checkName: string): ValidatorFunc => (
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

export const shouldRequireIf = (required: boolean): ValidatorFunc => (
  name: string,
  input: FormInput
) => {
  if (required) {
    return Required(name, input);
  }
  return { failures: [], value: input };
};

export const validateIf = (func: ValidatorFunc, predicate: boolean): ValidatorFunc => (
  name: string,
  input: FormInput
) => {
  if (predicate) {
    return func(name, input);
  }
  return { failures: [], value: input };
};

export const HeaderName: ValidatorFunc = (name: string, input: FormInput) => {
  if (typeof input === 'string') {
    if (input.trim().length > 0 && !headerUtils.validateHeaderName(input)) {
      return { failures: [{ message: 'Invalid header name' }], value: input };
    }
  }
  return { failures: [], value: input };
};

export const IsValidIntent = (classifier: Asset): ValidatorFunc => (
  name: string,
  input: FormInput
) => {
  if (typeof input === 'object') {
    const option = input as SelectOption;

    if (option && classifier && classifier.content) {
      const exists = !!classifier.content.intents.find((intent: string) => intent === option.value);
      if (!exists) {
        return {
          value: input,
          failures: [{ message: `${option.value} is not a valid intent for ${classifier.name}` }]
        };
      }
    }
    return { failures: [], value: input };
  }
  return { failures: [], value: input };
};

export const MaxOfTenItems = fromMaxItems(10);
export const StartIsNonNumeric = fromRegex(/^(?!\d)/, "can't start with a number");
export const ValidURL = fromRegex(REGEX_URL, 'is not a valid URL');
export const Numeric = fromRegex(/^([-+]?((\.\d+)|(\d+)(\.\d+)?)$)/, 'must be a number');
export const Alphanumeric = fromRegex(/^[a-z\d\-_\s]+$/i, 'can only have letters and numbers');
export const NumOrExp = fromRegex(/^@.*$|^([-+]?((\.\d+)|(\d+)(\.\d+)?)$)/, 'must be a number');
