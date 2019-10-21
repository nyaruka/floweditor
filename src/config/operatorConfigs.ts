import { HIDDEN, Operator, OperatorMap, Operators, TEXT_TYPES, ONLINE } from 'config/interfaces';

export const intentOperatorList: Operator[] = [
  {
    type: Operators.has_top_intent,
    verboseName: 'has top intent',
    operands: 2,
    visibility: ONLINE
  },
  {
    type: Operators.has_intent,
    verboseName: 'has intent',
    operands: 2,
    visibility: ONLINE
  }
];

export const operatorConfigList: Operator[] = [
  {
    type: Operators.has_any_word,
    verboseName: 'has any of the words',
    operands: 1,
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_all_words,
    verboseName: 'has all of the words',
    operands: 1,
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_phrase,
    verboseName: 'has the phrase',
    operands: 1,
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_only_phrase,
    verboseName: 'has only the phrase',
    operands: 1,
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_beginning,
    verboseName: 'starts with',
    operands: 1
  },
  {
    type: Operators.has_text,
    verboseName: 'has some text',
    operands: 0,
    categoryName: 'Has Text',
    visibility: TEXT_TYPES
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
  {
    type: Operators.has_number_lt,
    verboseName: 'has a number below',
    operands: 1
  },
  {
    type: Operators.has_number_lte,
    verboseName: 'has a number at or below',
    operands: 1
  },
  {
    type: Operators.has_number_eq,
    verboseName: 'has a number equal to',
    operands: 1
  },
  {
    type: Operators.has_number_gte,
    verboseName: 'has a number at or above',
    operands: 1
  },
  {
    type: Operators.has_number_gt,
    verboseName: 'has a number above',
    operands: 1
  },
  {
    type: Operators.has_date,
    verboseName: 'has a date',
    operands: 0,
    categoryName: 'Has Date',
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_date_lt,
    verboseName: 'has a date before',
    operands: 1,
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_date_eq,
    verboseName: 'has a date equal to',
    operands: 1,
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_date_gt,
    verboseName: 'has a date after',
    operands: 1,
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_time,
    verboseName: 'has a time',
    operands: 0,
    categoryName: 'Has Time',
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_group,
    verboseName: 'is in the group',
    operands: 1,
    visibility: HIDDEN
  },
  {
    type: Operators.has_category,
    verboseName: 'has the category',
    operands: 0,
    visibility: HIDDEN
  },
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
    categoryName: 'Has Email',
    visibility: TEXT_TYPES
  },
  {
    type: Operators.has_state,
    verboseName: 'has state',
    operands: 0,
    categoryName: 'Has State'
  },
  {
    type: Operators.has_district,
    verboseName: 'has district',
    operands: 1,
    categoryName: 'Has District'
  },
  {
    type: Operators.has_ward,
    verboseName: 'has ward',
    operands: 2,
    categoryName: 'Has Ward'
  },
  {
    type: Operators.has_error,
    verboseName: 'has an error',
    operands: 0,
    categoryName: 'Has Error',
    visibility: HIDDEN
  },
  {
    type: Operators.has_value,
    verboseName: 'is not empty',
    operands: 0,
    categoryName: 'Not Empty'
  },
  {
    type: Operators.has_pattern,
    verboseName: 'matches regex',
    operands: 1
  }
];

export const operatorConfigMap: OperatorMap = [...operatorConfigList, ...intentOperatorList].reduce(
  (map: OperatorMap, operatorConfig: Operator) => {
    map[operatorConfig.type] = operatorConfig;
    return map;
  },
  {}
);

/**
 * Shortcut for constant lookup of operator config in operator configs map
 * @param {string} type - The type of the operator config to return, e.g. 'send_msg'
 * @returns {Object} - The operator config found at operatorConfigs[type] or -1
 */
export const getOperatorConfig = (type: Operators): Operator => operatorConfigMap[type];
