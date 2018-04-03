import * as React from 'react';

import { renderIf } from '../../../utils';
import { pluralize, UnicodeCharMap } from './helpers';
import * as styles from './UnicodeList.scss';

export interface UnicodeListProps {
    unicodeChars: UnicodeCharMap;
}

export const utfWarning = (num: number) =>
    ` Note that your message may require more segments to send because it contains the following ${pluralize(
        num,
        'character'
    )}:`;

export const unicodeListContainerSpecId = 'unicode-list-container';
export const unicodeListSpecId = 'unicode-list';

const UnicodeList: React.SFC<UnicodeListProps> = ({ unicodeChars }) => {
    const chars = Object.keys(unicodeChars);
    return renderIf(chars.length > 0)(
        <div data-spec={unicodeListContainerSpecId}>
            {utfWarning(chars.length)}
            <div className={styles.unicodeList} data-spec={unicodeListSpecId}>
                {chars.map((char, idx) => (
                    <span key={char} className={styles.unicodeChar}>
                        {char}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default UnicodeList;
