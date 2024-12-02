import { Types } from 'config/interfaces';
import { SetContactAttribute } from 'flowTypes';
import * as React from 'react';
import { emphasize } from 'utils';
import i18n from 'config/i18n';
const styles = require('components/shared.module.scss');

const withEmph = (text: string, emph: boolean) => (emph ? emphasize(text) : text);

export const renderSetText = (
  name: string,
  value: string,
  emphasizeName: boolean = false
): JSX.Element => {
  if (value) {
    return (
      <div className={`${styles.node_asset}`}>
        Set {withEmph(name, emphasizeName)} to {emphasize(value)}.
      </div>
    );
  } else {
    return (
      <div>
        {i18n.t('forms.clear', 'Clear')} {withEmph(name, emphasizeName)}.
      </div>
    );
  }
};

const UpdateGroupComp: React.SFC<SetContactAttribute> = (
  action: SetContactAttribute
): JSX.Element => {
  if (action.type === Types.set_wa_group_field) {
    return renderSetText(action.field.name, action.value, true);
  }

  return null;
};

export default UpdateGroupComp;
