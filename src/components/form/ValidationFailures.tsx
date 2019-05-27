import * as React from 'react';
import { ValidationFailure } from 'store/nodeEditor';

import styles from './ValidationFailures.module.scss';

export interface Validation {
  validationFailures: ValidationFailure[];
}

const ValidationFailures: React.SFC<Validation> = (validation): JSX.Element => {
  const errors = validation.validationFailures.map((failure: ValidationFailure, idx: number) => {
    return (
      <div key={'validation_' + idx} className={styles.error}>
        {failure.message}
      </div>
    );
  });
  return <div className={styles.errors}>{errors}</div>;
};

export default ValidationFailures;
