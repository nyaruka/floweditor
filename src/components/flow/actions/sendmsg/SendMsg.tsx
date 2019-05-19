import Pill from 'components/pill/Pill';
import { SendMsg } from 'flowTypes';
import * as React from 'react';

import styles from './SendMsg.module.scss';

export const PLACEHOLDER = "Send a message to the contact";

const SendMsgComp: React.SFC<SendMsg> = (action: SendMsg): JSX.Element => {
  if (action.text) {
    let replies = null;

    if ((action.quick_replies || []).length > 0) {
      replies = (
        <div className={styles.quick_replies}>
          {action.quick_replies.map(reply => (
            <Pill
              style={{ marginLeft: 4, marginTop: 4 }}
              maxLength={20}
              advanced={true}
              key={action.uuid + reply}
              text={reply}
            />
          ))}
        </div>
      );
    }

    return (
      <>
        <div>
          {action.text.split(/\r?\n/).map((line: string, idx: number) => (
            <div key={action.uuid + idx} className={styles.line}>
              {line}
            </div>
          ))}
          {action.attachments && action.attachments.length > 0 ? (
            <div data-advanced={true} className={`${styles.attachment} fe-paperclip`} />
          ) : null}
          {action.templating && action.templating.template ? (
            <div data-advanced={true} className={`${styles.whatsapp} fe-whatsapp`} />
          ) : null}
        </div>
        <div className={styles.summary}>{replies}</div>
      </>
    );
  }
  return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendMsgComp;
