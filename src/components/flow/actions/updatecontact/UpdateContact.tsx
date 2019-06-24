import { getLanguageForCode } from 'components/flow/actions/updatecontact/helpers';
import { Types } from 'config/interfaces';
import {
  SetContactAttribute,
  SetContactChannel,
  SetContactLanguage,
  SetContactName
} from 'flowTypes';
import * as React from 'react';
import { emphasize } from 'utils';

const withEmph = (text: string, emph: boolean) => (emph ? emphasize(text) : text);

export const renderSetText = (
  name: string,
  value: string,
  emphasizeName: boolean = false
): JSX.Element => {
  if (value) {
    return (
      <div>
        Set {withEmph(name, emphasizeName)} to {emphasize(value)}.
      </div>
    );
  } else {
    return <div>Clear {withEmph(name, emphasizeName)}.</div>;
  }
};

const UpdateContactComp: React.SFC<SetContactAttribute> = (action: any) => {
  switch (action.type) {
    case Types.set_contact_field:
      return renderSetText(action.field.name, action.value, true);
    case Types.set_contact_channel:
      return renderSetText('channel', (action as SetContactChannel).channel.name);
    case Types.set_contact_language:
      const setLanguageAction = action as SetContactLanguage;
      return renderSetText(
        'language',
        getLanguageForCode(setLanguageAction.language, action.languages)
      );
    case Types.set_contact_name:
      return renderSetText('name', (action as SetContactName).name);
  }
};

export default UpdateContactComp;
