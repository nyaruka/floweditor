import i18n from 'config/i18n';

export const WAIT_LABEL = i18n.t('forms.message_label', 'If the message response...');
export const EXPRESSION_LABEL = i18n.t('forms.expression_label', 'If the expression...');
export const GROUP_LABEL = i18n.t(
  'forms.split_by_groups',
  "Select the groups you'd like to split by below"
);

export const OPERAND_LOCALIZATION_DESC = i18n.t(
  'forms.localize_rules',
  'Sometimes languages need special rules to route things properly. If a translation is not provided, the original rule will be used.'
);

// We intentionally don't localize these names
export enum DefaultExitNames {
  All_Responses = 'All Responses',
  No_Response = 'No Response',
  Any_Value = 'Any Value',
  Other = 'Other'
}
