import { SendInteractiveMsg } from 'flowTypes';
import * as React from 'react';

import styles from './SendInteractiveMsg.module.scss';
import i18n from 'config/i18n';

export const PLACEHOLDER = i18n.t(
  'actions.send_msg.placeholder',
  'Send interactive message to the contact'
);

const SendInteractiveMsgComp: React.SFC<SendInteractiveMsg> = (
  action: SendInteractiveMsg
): JSX.Element => {
  const message = JSON.parse(action.text);
  let body;
  if (message) {
    if (message.type === 'list') {
      body = message.body;
    } else if (message.type === 'quick_reply') {
      if (message.content.type === 'text') {
        body = message.content.text;
      } else if (['image', 'video'].includes(message.content.type)) {
        body = message.content.caption;
      }
    }
  }
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
