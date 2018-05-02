export enum Operators {
    has_any_word = 'has_any_word',
    has_all_words = 'has_all_words',
    has_phrase = 'has_phrase',
    has_only_phrase = 'has_only_phrase',
    has_beginning = 'has_beginning',
    has_text = 'has_text',
    has_date = 'has_date',
    has_date_lt = 'has_date_lt',
    has_date_eq = 'has_date_eq',
    has_date_gt = 'has_date_gt',
    has_number = 'has_number',
    has_number_between = 'has_number_between',
    has_number_lt = 'has_number_lt',
    has_number_lte = 'has_number_lte',
    has_number_eq = 'has_number_eq',
    has_number_gte = 'has_number_gte',
    has_number_gt = 'has_number_gt',
    has_run_status = 'has_run_status',
    is_text_eq = 'is_text_eq',
    has_group = 'has_group',
    has_phone = 'has_phone',
    has_email = 'has_email',
    has_error = 'has_error',
    has_value = 'has_value',
    has_wait_timed_out = 'has_wait_timed_out',
    has_district = 'has_district',
    has_state = 'has_state',
    has_ward = 'has_ward',
    has_pattern = 'has_pattern',
    is_error = 'is_error'
}

export interface Operator {
    type: Operators;
    verboseName: string;
    operands: number;
    // Default category name to use if specified
    categoryName?: string;
}

export interface OperatorMap {
    [propName: string]: Operator;
}

export const operatorConfigList: Operator[] = [
    { type: Operators.has_any_word, verboseName: 'has any of the words', operands: 1 },
    { type: Operators.has_all_words, verboseName: 'has all of the words', operands: 1 },
    { type: Operators.has_phrase, verboseName: 'has the phrase', operands: 1 },
    { type: Operators.has_only_phrase, verboseName: 'has only the phrase', operands: 1 },
    { type: Operators.has_beginning, verboseName: 'starts with', operands: 1 },
    {
        type: Operators.has_text,
        verboseName: 'has some text',
        operands: 0,
        categoryName: 'Has Text'
    },
    {
        type: Operators.has_number,
        verboseName: 'has a number',
        operands: 0,
        categoryName: 'Has Number'
    },
    {
        type: Operators.has_number_between,
        verboseName: 'has a number between',
        operands: 2
    },
    { type: Operators.has_number_lt, verboseName: 'has a number below', operands: 1 },
    {
        type: Operators.has_number_lte,
        verboseName: 'has a number at or below',
        operands: 1
    },
    { type: Operators.has_number_eq, verboseName: 'has a number equal to', operands: 1 },
    {
        type: Operators.has_number_gte,
        verboseName: 'has a number at or above',
        operands: 1
    },
    { type: Operators.has_number_gt, verboseName: 'has a number above', operands: 1 },
    { type: Operators.has_date, verboseName: 'has a date', operands: 0, categoryName: 'Has Date' },
    { type: Operators.has_date_lt, verboseName: 'has a date before', operands: 1 },
    { type: Operators.has_date_eq, verboseName: 'has a date equal to', operands: 1 },
    { type: Operators.has_date_gt, verboseName: 'has a date after', operands: 1 },
    { type: Operators.has_run_status, verboseName: 'has a run status of', operands: 1 },
    { type: Operators.has_group, verboseName: 'is in the group', operands: 1 },
    {
        type: Operators.has_phone,
        verboseName: 'has a phone number',
        operands: 0,
        categoryName: 'Has Phone'
    },
    {
        type: Operators.has_email,
        verboseName: 'has an email',
        operands: 0,
        categoryName: 'Has Email'
    },
    {
        type: Operators.has_error,
        verboseName: 'has an error',
        operands: 0,
        categoryName: 'Has Error'
    },
    {
        type: Operators.has_value,
        verboseName: 'is not empty',
        operands: 0,
        categoryName: 'Not Empty'
    }
];

export const operatorConfigMap: OperatorMap = operatorConfigList.reduce(
    (map: OperatorMap, operatorConfig: Operator) => {
        map[operatorConfig.type] = operatorConfig;
        return map;
    },
    {}
);

export type GetOperatorConfig = (type: string) => Operator;

/**
 * Shortcut for constant lookup of operator config in operator configs map
 * @param {string} type - The type of the operator config to return, e.g. 'send_msg'
 * @returns {Object} - The operator config found at operatorConfigs[type] or -1
 */
export const getOperatorConfig = (type: string): Operator => operatorConfigMap[type];
