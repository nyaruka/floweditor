import * as React from 'react';

import { LinkSheets } from 'flowTypes';
import { ReactComponent as SheetIcon } from './icons/sheet.svg';
import styles from 'components/flow/routers/sheet/Sheet.module.scss';

const Sheet: React.SFC<LinkSheets> = (action: LinkSheets): JSX.Element => (
  <div>
    <div className={styles.sheet}>
      <SheetIcon />
      <a href={action.url} target="_blank" rel="noopener noreferrer" className={styles.sheet_link}>
        {action.name}
      </a>
    </div>
    <div className={styles.row}>
      Selected row with value <strong>{action.row}</strong>
    </div>
  </div>
);

export default Sheet;
