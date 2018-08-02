import * as React from 'react';
import * as classNames from 'classnames/bind';
import * as styles from '~/components/form/textinput/CharCount.scss';
import { UnicodeCharMap, pluralize } from '~/components/form/textinput/helpers';
import UnicodeList from '~/components/form/textinput/UnicodeList';

interface CharCountProps {
    count: number;
    parts: number;
    unicodeChars: UnicodeCharMap;
}

const cx = classNames.bind(styles);

const CharCount: React.SFC<CharCountProps> = ({ count, parts, unicodeChars }) => {
    const hasUnicode = Object.keys(unicodeChars).length > 0;
    const toolTipTextClasses = cx({
        [styles.tooltipText]: true,
        [styles.unicode]: hasUnicode
    });
    return (
        <div className={styles.count}>
            <div className={styles.tooltip}>
                {count}
                <span className={styles.divider}>/</span>
                {parts}
                <span className={toolTipTextClasses}>
                    This message will be about <b>{count}</b> {pluralize(count, 'character')} long.
                    We estimate it will take <b>{parts}</b> {pluralize(parts, 'segment')} to send
                    over SMS.
                    {hasUnicode && <UnicodeList unicodeChars={unicodeChars} />}
                </span>
            </div>
        </div>
    );
};

export default CharCount;
