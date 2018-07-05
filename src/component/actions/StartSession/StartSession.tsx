import * as React from 'react';
import { getRecipients, renderAssetList } from '~/component/actions/helpers';
import { StartSession } from '~/flowTypes';
import { AssetType } from '~/services/AssetService';

const styles = require('./StartSession.scss');

const MAX_TO_SHOW = 3;

const StartSessionComp: React.SFC<StartSession> = (action: StartSession): JSX.Element => {
    const recipients = getRecipients(action);
    return (
        <div className={styles.node}>
            <div className={styles.to}>{renderAssetList(recipients, MAX_TO_SHOW)}</div>
            <div className={styles.flow}>
                {renderAssetList([
                    { name: action.flow.name, id: action.flow.uuid, type: AssetType.Flow }
                ])}
            </div>
        </div>
    );
};

export default StartSessionComp;
