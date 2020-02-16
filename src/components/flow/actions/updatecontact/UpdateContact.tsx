import { getLanguageForCode } from 'components/flow/actions/updatecontact/helpers';
import { Types } from 'config/interfaces';
import {
  SetContactAttribute,
  SetContactChannel,
  SetContactLanguage,
  SetContactName,
  WithIssues,
  FlowIssue,
  FlowIssueType
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

const UpdateContactComp: React.SFC<SetContactAttribute & WithIssues> = (
  action: SetContactAttribute & WithIssues
): JSX.Element => {
  if (action.type === Types.set_contact_field) {
    const missing = !!action.issues.find(
      (issue: FlowIssue) =>
        issue.type === FlowIssueType.MISSING_DEPENDENCY && issue.dependency.key === action.field.key
    );
    return renderSetText(action.field.name, action.value, true, missing);
  }

  if (action.type === Types.set_contact_channel) {
    const setContactAction = action as SetContactChannel;
    const missing = !!action.issues.find(
      (issue: FlowIssue) =>
        issue.type === FlowIssueType.MISSING_DEPENDENCY &&
        issue.dependency.uuid === setContactAction.channel.uuid
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
