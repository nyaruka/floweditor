import { getRecipients, renderAssetList, renderAsset } from 'components/flow/actions/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { StartSession } from 'flowTypes';
import * as React from 'react';
import { AssetType } from 'store/flowContext';

import styles from './StartSession.module.scss';

const MAX_TO_SHOW = 5;

export const StartSessionComp: React.SFC<StartSession> = (
  action: StartSession,
  context: any
): JSX.Element => {
  const recipients = getRecipients(action);
  return (
    <div className={styles.node}>
      <div className={styles.to}>
        {action.create_contact
          ? 'Create a new contact'
          : action.contact_query
          ? action.contact_query
          : renderAssetList(recipients, MAX_TO_SHOW, context.config.endpoints)}
      </div>
      <div className={styles.flow}>
        {renderAsset(
          {
            name: action.flow.name,
            id: action.flow.uuid,
            type: AssetType.Flow
          },
          context.config.endpoints
        )}
      </div>
    </div>
  );
};

StartSessionComp.contextTypes = {
  config: fakePropType
};

export default StartSessionComp;
