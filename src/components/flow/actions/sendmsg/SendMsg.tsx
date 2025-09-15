import Pill from 'components/pill/Pill';
import { SendMsg } from 'flowTypes';
import * as React from 'react';

import styles from './SendMsg.module.scss';
import i18n from 'config/i18n';

export const PLACEHOLDER = i18n.t('actions.send_msg.placeholder', 'Send a message to the contact');

const SendMsgComp: React.SFC<SendMsg> = (action: SendMsg): JSX.Element => {
  if (action.text) {
    let replies = null;

    const quickReplies: string[] = action.quick_replies || [];
    if (quickReplies.length > 0) {
      replies = (
        <div className={styles.quick_replies}>
          {quickReplies.map((reply, index) => (
            <Pill
              style={{ marginLeft: 4, marginTop: 4 }}
              maxLength={20}
              advanced={true}
              key={action.uuid + index}
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
          {(action.attachments && action.attachments.length > 0) || action.template ? (
            <div style={{ display: 'inline-flex' }}>
              {action.attachments && action.attachments.length > 0 ? (
                <temba-icon style={{ marginRight: 6, marginTop: 6 }} name="attachment"></temba-icon>
              ) : null}
              {action.template ? (
                <temba-icon
                  style={{ marginRight: 6, marginTop: 6 }}
                  name="channel_wac"
                ></temba-icon>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className={styles.summary}>{replies}</div>
      </>
    );
  }
  return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendMsgComp;
