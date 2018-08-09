import { titleCase } from '~/utils';
import { Operators, Operator } from '~/config/operatorConfigs';

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
    const trimmed = str.trim();
    if (isFloat(trimmed)) {
        return parseFloat(str);
    } else if (isInt(trimmed)) {
        return parseInt(trimmed, 10);
    }
};

/**
 * Applies prefix, title case to operator
 */
export const composeExitName = (
    operatorType: string,
    newArgList: string[],
    newExitName: string
): string => {
    if (operatorType === Operators.has_number_between) {
        if (newExitName && !/-/.test(newExitName)) {
            return newExitName;
        }
        const { min, max } = getMinMax(newArgList);

        return `${min ? min : newArgList[0] || ''} - ${max ? max : newArgList[1] || ''}`;
    }

    const pre = prefix(operatorType);

    if (newArgList.length) {
        const [firstArg] = newArgList;
        const words = firstArg.match(/\w+/g);

        if (words && words.length > 0) {
            const [firstWord] = words;
            return pre + titleCase(firstWord);
        }

        return pre + titleCase(firstArg);
    } else {
        return pre;
    }
};

/**
 * Returns the right exit name for a given case
 */
export const getExitName = (
    exitName: string,
    operatorConfig: Operator,
    newArgList: string[] = []
): string => {
    // Don't reassign func params
    let newExitName = exitName;

    if (newArgList.length >= 0 && !operatorConfig.categoryName) {
        newExitName = composeExitName(operatorConfig.type, newArgList, newExitName);
    } else if (!newExitName && operatorConfig.categoryName) {
        // Some operators don't expect args
        // Use the operator's default category name
        ({ categoryName: newExitName } = operatorConfig);
    }

    return newExitName;
};
