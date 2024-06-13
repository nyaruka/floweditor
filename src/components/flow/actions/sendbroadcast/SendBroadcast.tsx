import { getRecipients, renderAssetList } from 'components/flow/actions/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { BroadcastMsg } from 'flowTypes';
import * as React from 'react';

import styles from './SendBroadcast.module.scss';
import i18n from 'config/i18n';
import { ellipsize } from 'utils';

export const PLACEHOLDER = i18n.t(
  'actions.send_broadcast.placeholder',
  'Send a message to the contact'
);

const MAX_TO_SHOW = 5;

const SendBroadcastComp: React.SFC<BroadcastMsg> = (
  action: BroadcastMsg,
  context: any
): JSX.Element => {
  const assets = getRecipients(action);
  return (
    <>
      <div className={styles.node}>
        <div className={styles.to} key={action.uuid + '_broadcast_recipients'}>
          {renderAssetList(assets, MAX_TO_SHOW, context.config.endpoints)}
        </div>
        <div className={styles.message}>
          {action.text && action.text.length > 0 ? (
            action.text.split(/\r?\n/).map((line: string, idx: number) => (
              <div key={action.uuid + idx} className={styles.line}>
                {ellipsize(line, 125)}
              </div>
            ))
          ) : (
            <div className="placeholder">{PLACEHOLDER}</div>
          )}
          {action.attachments && action.attachments.length > 0 ? (
            <temba-icon
              name="attachment"
              style={{ marginTop: '0.4em', display: 'block' }}
            ></temba-icon>
          ) : null}
        </div>
      </div>
    </>
  );
};

SendBroadcastComp.contextTypes = {
  config: fakePropType
};

export default SendBroadcastComp;
