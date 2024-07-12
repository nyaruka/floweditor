import { getLanguageForCode } from 'components/flow/actions/updatecontact/helpers';
import i18n from 'config/i18n';
import { Types } from 'config/interfaces';
import {
  SetContactAttribute,
  SetContactChannel,
  SetContactLanguage,
  SetContactName,
  SetContactStatus
} from 'flowTypes';
import * as React from 'react';
import { emphasize } from 'utils';
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

const UpdateContactComp: React.SFC<SetContactAttribute> = (
  action: SetContactAttribute
): JSX.Element => {
  if (action.type === Types.set_contact_field) {
    return renderSetText(action.field.name, action.value, true);
  }

  if (action.type === Types.set_contact_channel) {
    const setContactAction = action as SetContactChannel;
    return renderSetText(
      'channel',
      setContactAction.channel ? setContactAction.channel.name : null,
      false
    );
  }

  if (action.type === Types.set_contact_language) {
    const setLanguageAction = action as SetContactLanguage;
    return renderSetText(
      'language',
      getLanguageForCode(setLanguageAction.language, (action as any).languages),
      false
    );
  }

  if (action.type === Types.set_contact_status) {
    return renderSetText('status', (action as SetContactStatus).status, false);
  }

  if (action.type === Types.set_contact_name) {
    return renderSetText('name', (action as SetContactName).name, false);
  }

  return null;
};

export default UpdateContactComp;
