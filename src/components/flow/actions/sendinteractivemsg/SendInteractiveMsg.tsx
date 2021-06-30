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
  if (action.text) {
    return (
      <div>
        {action.text.split(/\r?\n/).map((line: string, idx: number) => (
          <div key={action.uuid + idx} className={styles.line}>
            {line}
          </div>
        ))}
      </div>
    );
  }

  return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendInteractiveMsgComp;
