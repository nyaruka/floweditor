import { UnicodeCharMap } from 'components/form/textinput/helpers';
import * as React from 'react';
import { pluralize, renderIf } from 'utils';

import styles from './UnicodeList.module.scss';

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
    <span data-testid={unicodeListContainerSpecId}>
      {utfWarning(chars.length)}
      <div className={styles.unicode_list} data-testid={unicodeListSpecId}>
        {chars.map((char, idx) => (
          <span key={char} className={styles.unicode_char}>
            {char}
          </span>
        ))}
      </div>
    </span>
  );
};

export default UnicodeList;
