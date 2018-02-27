import * as React from 'react';
import * as uniqid from 'uniqid';
import { UnicodeCharMap, pluralize } from './helpers';
import * as styles from './UnicodeList.scss';

interface UnicodeListProps {
    unicodeChars: UnicodeCharMap;
}

export const utfWarning = (num: number) =>
    ` Note that your message may require more segments to send because it contains the following ${pluralize(
        num,
        'character'
    )}:`;

const UnicodeList: React.SFC<UnicodeListProps> = ({ unicodeChars }) => {
    const chars = Object.keys(unicodeChars);
    if (chars.length) {
        return (
            <React.Fragment>
                {utfWarning(chars.length)}
                <div className={styles.unicodeList}>
                    {chars.map((char, idx) => (
                        <span key={uniqid()} className={styles.unicodeChar}>
                            {char}
                        </span>
                    ))}
                </div>
            </React.Fragment>
        );
    }
    return null;
};

export default UnicodeList;
