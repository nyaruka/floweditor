import * as React from 'react';
import { TransferAirtime } from '~/flowTypes';

import * as styles from './TransferAirtime.scss';

const TransferAirtimeComp: React.SFC<TransferAirtime> = (transfer): JSX.Element => {
    const details = Object.keys(transfer.amounts).map((key: string) => {
        return (
            <div key={'transfer_' + key}>
                <div className={styles.amount}>{transfer.amounts[key]}</div>
                <div className={styles.code}>{key}</div>
            </div>
        );
    });

    return <div>{details}</div>;
};

export default TransferAirtimeComp;
