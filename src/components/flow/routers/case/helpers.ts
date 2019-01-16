import { getOperatorConfig, Operator, Operators } from '~/config/operatorConfigs';
import {
    validate,
    validateLessThan,
    validateMoreThan,
    validateNumeric,
    validateRequired
} from '~/store/validators';
import { titleCase } from '~/utils';

import { CaseElementProps, CaseElementState } from './CaseElement';

export const initializeForm = (props: CaseElementProps): CaseElementState => {
    return {
        errors: [],
        operatorConfig: getOperatorConfig(props.kase.type),
        argument: {
            value:
                props.kase.arguments && props.kase.arguments.length === 1
                    ? props.kase.arguments[0]
                    : ''
        },
        min: {
            value:
                props.kase.arguments && props.kase.arguments.length === 2
                    ? props.kase.arguments[0]
                    : ''
        },
        max: {
            value:
                props.kase.arguments && props.kase.arguments.length === 2
                    ? props.kase.arguments[1]
                    : ''
        },
        exitName: { value: props.exitName || '' },
        exitNameEdited: !!props.exitName,
        valid: true
    };
};
/**
 * Determines prefix for case's exit name
 */
export const prefix = (operatorType: string): string => {
    let pre = '';

    if (operatorType.indexOf('_lt') > -1) {
        if (operatorType.indexOf('date') > -1) {
            pre = 'Before ';
        } else {
            if (operatorType.indexOf('lte') > -1) {
                pre = '<= ';
            } else {
                pre = '< ';
            }
        }
    } else if (operatorType.indexOf('_gt') > -1) {
        if (operatorType.indexOf('date') > -1) {
            pre = 'After ';
        } else {
            if (operatorType.indexOf('gte') > -1) {
                pre = '>= ';
            } else {
                pre = '>';
            }
        }
    }

    return pre;
};

/**
 * Returns min, max values for Operators.has_number_between case
 */
export const getMinMax = (args: string[] = []): { min: string; max: string } => {
    let min = '';
    let max = '';
    if (args.length) {
        if (strContainsNum(args[0])) {
            min = args[0];
        }
        if (args[1]) {
            if (strContainsNum(args[1])) {
                max = args[1];
            }
        }
    }
    return {
        min,
        max
    };
};

export const isFloat = (val: string): boolean => /^[+-]?\d?(\.\d*)?$/.test(val.trim());

export const isInt = (val: string): boolean => /^[\+\-]?\d+$/.test(val.trim());

export const strContainsNum = (str: string): boolean => {
    const trimmed = str.trim();
    if (isFloat(trimmed)) {
        return true;
    } else if (isInt(trimmed)) {
        return true;
    } else {
        return false;
    }
};

export const parseNum = (str: string): number => {
    const trimmed = (str || '').trim();
    if (isFloat(trimmed)) {
        return parseFloat(str);
    } else if (isInt(trimmed)) {
        return parseInt(trimmed, 10);
    }
};

export const validateCase = (keys: {
    operatorConfig: Operator;
    argument?: string;
    min?: string;
    max?: string;
    exitName?: string;
    exitEdited?: boolean;
}): Partial<CaseElementState> => {
    // when the exit is set, our arguments become required
    const validators = keys.exitEdited && keys.exitName ? [validateRequired] : [];

    const updates: Partial<CaseElementState> = {
        operatorConfig: keys.operatorConfig
    };

    if (keys.operatorConfig.operands > 0) {
        switch (keys.operatorConfig.type) {
            case Operators.has_number_eq:
            case Operators.has_number_gt:
            case Operators.has_number_gte:
            case Operators.has_number_lt:
            case Operators.has_number_lte:
                validators.push(validateNumeric);
                break;
        }

        if (keys.operatorConfig.type === Operators.has_number_between) {
            updates.min = validate(
                'Minimum value',
                keys.min || '',
                validators.concat([
                    validateNumeric,
                    validateLessThan(parseFloat(keys.max), 'the maximum')
                ])
            );

            updates.max = validate(
                'Maximum value',
                keys.max || '',
                validators.concat([
                    validateNumeric,
                    validateMoreThan(parseFloat(keys.min), 'the minimum')
                ])
            );

            updates.argument = { value: '' };
        } else {
            updates.min = { value: '' };
            updates.max = { value: '' };
            updates.argument = validate('Value', keys.argument || '', validators);
        }
    } else {
        // no operand clear them all
        updates.min = { value: '' };
        updates.max = { value: '' };
        updates.argument = { value: '' };
    }

    updates.exitNameEdited = !!keys.exitEdited;
    updates.exitName = { value: updates.exitNameEdited ? keys.exitName : getExitName(updates) };

    return updates;
};

export const getExitName = (state: Partial<CaseElementState>): string => {
    if (state.exitNameEdited) {
        return state.exitName.value;
    }

    if (state.operatorConfig.operands === 0) {
        return state.operatorConfig.categoryName;
    }

    if (
        state.operatorConfig.type === Operators.has_number_between &&
        state.min.value &&
        state.max.value
    ) {
        return `${state.min.value} - ${state.max.value}`;
    }

    if (state.argument && state.argument.value) {
        const pre = prefix(state.operatorConfig.type);
        const words = state.argument.value.match(/\w+/g);

        if (words && words.length > 0) {
            const [firstWord] = words;
            return pre + titleCase(firstWord);
        }

        return pre + titleCase(state.argument.value);
    }
    return '';
};
