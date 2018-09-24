import * as React from 'react';
import { pluralize, UnicodeCharMap } from '~/components/form/textinput/helpers';
import * as styles from '~/components/form/textinput/UnicodeList.scss';
import { renderIf } from '~/utils';

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
        <span data-spec={unicodeListContainerSpecId}>
            {utfWarning(chars.length)}
            <div className={styles.unicodeList} data-spec={unicodeListSpecId}>
                {chars.map((char, idx) => (
                    <span key={char} className={styles.unicodeChar}>
                        {char}
                    </span>
                ))}
            </div>
        </span>
    );
};

export default UnicodeList;
