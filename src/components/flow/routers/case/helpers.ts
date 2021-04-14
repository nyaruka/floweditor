import { isRelativeDate } from 'components/flow/routers/helpers';
import { Operator, Operators } from 'config/interfaces';
import { getOperatorConfig } from 'config/operatorConfigs';
import {
  LessThan,
  MoreThan,
  Numeric,
  NumOrExp,
  Required,
  validate,
  IsValidIntent
} from 'store/validators';
import { titleCase } from 'utils';

import { CaseElementProps, CaseElementState } from './CaseElement';
import { SelectOption } from 'components/form/select/SelectElement';
import { Asset } from 'store/flowContext';
import i18n from 'config/i18n';

export const initializeForm = (props: CaseElementProps): CaseElementState => {
  const arg1 =
    props.kase.arguments && props.kase.arguments.length >= 1 ? props.kase.arguments[0] : '';
  const arg2 =
    props.kase.arguments && props.kase.arguments.length === 2 ? props.kase.arguments[1] : '';

  return {
    errors: [],
    operatorConfig: getOperatorConfig(props.kase.type),
    argument: { value: arg1 },
    min: { value: arg1 },
    max: { value: arg2 },
    state: { value: arg1 },
    district: { value: arg2 },
    intent: { value: arg1 ? { name: arg1, value: arg1 } : null },
    confidence: { value: arg2 },
    categoryName: { value: props.categoryName || '' },
    categoryNameEdited: !!props.categoryName,
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

export const isInt = (val: string): boolean => /^[+-]?\d+$/.test(val.trim());

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
  state?: string;
  district?: string;
  min?: string;
  max?: string;
  confidence?: string;
  intent?: SelectOption;
  exitName?: string;
  exitEdited?: boolean;
  classifier?: Asset;
}): Partial<CaseElementState> => {
  // when the exit is set, our arguments become required
  const validators = keys.exitEdited && keys.exitName ? [Required] : [];

  const updates: Partial<CaseElementState> = {
    operatorConfig: keys.operatorConfig
  };

  updates.district = { value: '', validationFailures: [] };
  updates.state = { value: '', validationFailures: [] };
  updates.min = { value: '', validationFailures: [] };
  updates.max = { value: '', validationFailures: [] };
  updates.argument = { value: '', validationFailures: [] };
  updates.intent = { value: null, validationFailures: [] };
  updates.confidence = { value: '', validationFailures: [] };

  if (keys.operatorConfig.operands > 0) {
    switch (keys.operatorConfig.type) {
      case Operators.has_number_eq:
      case Operators.has_number_gt:
      case Operators.has_number_gte:
      case Operators.has_number_lt:
      case Operators.has_number_lte:
        validators.push(NumOrExp);
        break;
      case Operators.has_date_eq:
      case Operators.has_date_lt:
      case Operators.has_date_gt:
        validators.push(Numeric);
        break;
    }

    if (keys.operatorConfig.type === Operators.has_number_between) {
      const max = keys.max || '';
      const min = keys.min || '';

      const maxExpression = max.indexOf('@') > -1;
      const minExpression = min.indexOf('@') > -1;
      const hasExpression = maxExpression || minExpression;

      const numeric = [Numeric];

      updates.min = validate(
        i18n.t('forms.minimum_value', 'Minimum value'),
        min,
        validators
          .concat(!minExpression ? numeric : [])
          .concat(
            !hasExpression
              ? [LessThan(parseFloat(keys.max), i18n.t('forms.the_maximum', 'the maximum'))]
              : []
          )
      );

      updates.max = validate(
        i18n.t('forms.maximum_value', 'Maximum value'),
        max,
        validators
          .concat(!maxExpression ? numeric : [])
          .concat(
            !hasExpression
              ? [MoreThan(parseFloat(keys.min), i18n.t('forms.the_minimum', 'the minimum'))]
              : []
          )
      );
    } else if (keys.operatorConfig.type === Operators.has_district) {
      updates.argument = validate(
        i18n.t('forms.state', 'State'),
        keys.argument || '',
        validators.concat([])
      );
    } else if (keys.operatorConfig.type === Operators.has_ward) {
      updates.state = validate(
        i18n.t('forms.state', 'State'),
        keys.state || '',
        validators.concat([])
      );
      updates.district = validate(
        i18n.t('forms.district', 'District'),
        keys.district || '',
        validators.concat([])
      );
    } else if (
      keys.operatorConfig.type === Operators.has_top_intent ||
      keys.operatorConfig.type === Operators.has_intent
    ) {
      const intentValidators = [IsValidIntent(keys.classifier)];
      if (keys.confidence) {
        intentValidators.push(Required);
      }
      updates.intent = validate(i18n.t('forms.intent', 'Intent'), keys.intent, intentValidators);
      updates.confidence = validate(
        i18n.t('forms.confidence', 'Confidence'),
        keys.confidence || '',
        validators.concat(keys.intent ? [Numeric, Required] : [Numeric])
      );
    } else {
      updates.argument = validate('Value', keys.argument || '', validators);
    }
  }

  updates.categoryNameEdited = !!keys.exitEdited;
  updates.categoryName = validate(
    i18n.t('forms.category', 'Category'),
    updates.categoryNameEdited ? keys.exitName : getCategoryName(updates),
    updates.argument.value ||
      (updates.min.value && updates.max.value) ||
      (updates.state.value && updates.district.value)
      ? [Required]
      : []
  );

  updates.valid =
    updates.state.validationFailures.length === 0 &&
    updates.district.validationFailures.length === 0 &&
    updates.min.validationFailures.length === 0 &&
    updates.max.validationFailures.length === 0 &&
    updates.argument.validationFailures.length === 0 &&
    updates.intent.validationFailures.length === 0 &&
    updates.confidence.validationFailures.length === 0 &&
    updates.categoryName.validationFailures.length === 0;

  return updates;
};

export const getCategoryName = (state: Partial<CaseElementState>): string => {
  if (state.categoryNameEdited) {
    return state.categoryName.value;
  }

  if (state.operatorConfig.operands === 0) {
    return state.operatorConfig.categoryName;
  }

  if (
    state.operatorConfig.type === Operators.has_intent ||
    state.operatorConfig.type === Operators.has_top_intent
  ) {
    if (state.intent.value) {
      return titleCase(state.intent.value.name.replace('_', ' '));
    }
  }

  if (
    state.operatorConfig.type === Operators.has_number_between &&
    state.min.value &&
    state.max.value
  ) {
    return `${state.min.value} - ${state.max.value}`;
  }

  if (isRelativeDate(state.operatorConfig.type)) {
    const count = parseInt(state.argument.value, 10);
    if (!isNaN(count)) {
      const today =
        state.operatorConfig.type === Operators.has_date_eq
          ? i18n.t('forms.today_proper', 'Today')
          : i18n.t('forms.today', 'today');
      const op = count < 0 ? ' - ' : ' + ';
      const inDays =
        ' ' + (Math.abs(count) === 1 ? i18n.t('forms.day', 'day') : i18n.t('forms.days', 'days'));
      return prefix(state.operatorConfig.type) + today + op + Math.abs(count) + inDays;
    }
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
