import { getLanguageForCode } from 'components/flow/actions/updatecontact/helpers';
import { Types } from 'config/interfaces';
import {
  SetContactAttribute,
  SetContactChannel,
  SetContactLanguage,
  SetContactName,
  MissingDependencies,
  Dependency
} from 'flowTypes';
import * as React from 'react';
import { emphasize } from 'utils';
const styles = require('components/shared.module.scss');

const withEmph = (text: string, emph: boolean) => (emph ? emphasize(text) : text);

export const renderSetText = (
  name: string,
  value: string,
  emphasizeName: boolean = false,
  missing: boolean
): JSX.Element => {
  if (value) {
    return (
      <div className={`${styles.node_asset} ${missing ? styles.missing_asset : ''}`}>
        Set {withEmph(name, emphasizeName)} to {emphasize(value)}.
      </div>
    );
  } else {
    return <div>Clear {withEmph(name, emphasizeName)}.</div>;
  }
};

const UpdateContactComp: React.SFC<SetContactAttribute & MissingDependencies> = (
  action: SetContactAttribute & MissingDependencies
): JSX.Element => {
  if (action.type === Types.set_contact_field) {
    const missing = !!action.missingDependencies.find(
      (dep: Dependency) => dep.key === action.field.key
    );
    return renderSetText(action.field.name, action.value, true, missing);
  }

  if (action.type === Types.set_contact_channel) {
    const setContactAction = action as SetContactChannel;
    const missing = !!action.missingDependencies.find(
      (dep: Dependency) => dep.uuid === setContactAction.channel.uuid
    );
    return renderSetText('channel', setContactAction.channel.name, false, missing);
  }

  if (action.type === Types.set_contact_language) {
    const setLanguageAction = action as SetContactLanguage;
    return renderSetText(
      'language',
      getLanguageForCode(setLanguageAction.language, (action as any).languages),
      false,
      false
    );
  }

  if (action.type === Types.set_contact_name) {
    return renderSetText('name', (action as SetContactName).name, false, false);
  }

  return null;
};

export default UpdateContactComp;
