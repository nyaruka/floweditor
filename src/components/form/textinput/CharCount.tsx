import classNames from 'classnames/bind';
import { UnicodeCharMap } from 'components/form/textinput/helpers';
import UnicodeList from 'components/form/textinput/UnicodeList';
import React from 'react';
import { pluralize } from 'utils';

import styles from './CharCount.module.scss';

interface CharCountProps {
  count: number;
  parts: number;
  unicodeChars: UnicodeCharMap;
}

const cx: any = classNames.bind(styles);

const CharCount: React.SFC<CharCountProps> = ({
  count,
  parts,
  unicodeChars
}) => {
  const hasUnicode = Object.keys(unicodeChars).length > 0;
  const toolTipTextClasses = cx({
    [styles.tooltip_text]: true,
    [styles.unicode]: hasUnicode
  });
  return (
    <div className={styles.count}>
      <div className={styles.tooltip}>
        {count}
        <span className={styles.divider}>/</span>
        {parts}
        <span className={toolTipTextClasses}>
          This message will be about <b>{count}</b>{" "}
          {pluralize(count, "character")} long. We estimate it will take{" "}
          <b>{parts}</b> {pluralize(parts, "message")} to send over SMS.
          {hasUnicode && <UnicodeList unicodeChars={unicodeChars} />}
          <div className={styles.fine_print}>
            Using variables may result in longer messages that require more
            messages to send over SMS.
          </div>
        </span>
      </div>
    </div>
  );
};

export default CharCount;
