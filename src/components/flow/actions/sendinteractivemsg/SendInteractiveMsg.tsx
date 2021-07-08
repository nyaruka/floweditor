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
  if (action.name) {
    return <div>{action.name}</div>;
  }

  return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendInteractiveMsgComp;
