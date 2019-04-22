import * as React from 'react';
import { getRecipients, renderAssetList } from '~/components/flow/actions/helpers';
import { fakePropType } from '~/config/ConfigProvider';
import { StartSession } from '~/flowTypes';
import { AssetType } from '~/store/flowContext';

const styles = require('./StartSession.scss');

const MAX_TO_SHOW = 3;

const StartSessionComp: React.SFC<StartSession> = (
    action: StartSession,
    context: any
): JSX.Element => {
    const recipients = getRecipients(action);
    return (
        <div className={styles.node}>
            <div className={styles.to}>
                {renderAssetList(recipients, MAX_TO_SHOW, context.config.endpoints)}
            </div>
            <div className={styles.flow}>
                {renderAssetList(
                    [{ name: action.flow.name, id: action.flow.uuid, type: AssetType.Flow }],
                    3,
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
