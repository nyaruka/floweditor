import * as React from 'react';
import { hasErrors } from 'components/flow/actions/helpers';
import OptionalTextInput from 'components/form/optionaltext/OptionalTextInput';
import { StringEntry } from 'store/nodeEditor';
import { snakify } from 'utils';
import { Trans } from 'react-i18next';
import i18n from 'config/i18n';

export const createResultNameInput = (
  value: StringEntry,
  onChange: (value: string) => void
): JSX.Element => {
  const snaked = !hasErrors(value) && value.value ? '.' + snakify(value.value) : '';

  return (
    <OptionalTextInput
      name={i18n.t('forms.save_result_name', 'Result Name')}
      maxLength={64}
      value={value}
      onChange={onChange}
      toggleText={i18n.t('forms.save_as_title', 'Save as..')}
      helpText={
        <Trans i18nKey="forms.result_name_help" values={{ resultFormat: `@results${snaked}` }}>
          By naming the result, you can reference it later using [[resultFormat]]
        </Trans>
      }
    />
  );
};
