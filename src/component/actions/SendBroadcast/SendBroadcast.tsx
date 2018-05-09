import * as React from 'react';

import { BroadcastMsg } from '../../../flowTypes';
import * as styles from './SendBroadcast.scss';

export const PLACEHOLDER = 'Send a message to the contact';

const addRecipients = (
    recipients: JSX.Element[],
    key: string,
    toAdd: Array<{ name: string; uuid: string }>,
    icon: string = null
) => {
    for (const item of toAdd) {
        if (recipients.length <= 3) {
            if (recipients.length < 3) {
                const iconEle =
                    icon !== null ? <span className={`${styles.icon} ${icon}`} /> : null;
                recipients.push(
                    <div key={key + item.uuid}>
                        {iconEle}
                        <span className={styles.name}>{item.name}</span>
                    </div>
                );
            } else {
                recipients.push(
                    <div key={key + '...'} className={styles.more}>
                        ...
                    </div>
                );
            }
        }
    }
};

const SendBroadcastComp: React.SFC<BroadcastMsg> = ({
    uuid,
    groups,
    contacts,
    text
}): JSX.Element => {
    const recipients: JSX.Element[] = [];

    addRecipients(recipients, uuid, groups, 'icn-group');
    addRecipients(recipients, uuid, contacts);

    if (text) {
        return (
            <div className={styles.node}>
                <div className={styles.to}>{recipients}</div>
                <div className={styles.message}>{text}</div>
            </div>
        );
    }
    return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendBroadcastComp;
