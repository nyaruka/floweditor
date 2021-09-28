import { SendInteractiveMsg } from 'flowTypes';
import * as React from 'react';

import i18n from 'config/i18n';
import { getMsgBody } from './helpers';

export const PLACEHOLDER = i18n.t(
  'actions.send_msg.placeholder',
  'Send interactive message to the contact'
);

const SendInteractiveMsgComp: React.SFC<SendInteractiveMsg> = (
  action: SendInteractiveMsg
): JSX.Element => {
  const message = JSON.parse(action.text);
  const body = getMsgBody(message);
  if (action.name) {
    return (
      <div>
        <div>
          <strong>{action.name}</strong>
        </div>
        <div>{body}</div>
      </div>
    );
  }

  return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendInteractiveMsgComp;
