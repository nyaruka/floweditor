import Pill from 'components/pill/Pill';
import * as React from 'react';

import styles from './SendMsg.module.scss';
import i18n from 'config/i18n';
import { Delay } from 'flowTypes';

const Sequence: React.SFC<Delay> = (action: Delay): JSX.Element => {
  console.log(action);

  const delayInSeconds = parseInt(action.delay ? action.delay : '0');
  const days = Math.floor(delayInSeconds / (3600 * 24)).toString();
  const hours = Math.floor((delayInSeconds % (3600 * 24)) / 3600).toString();
  const minutes = Math.floor((delayInSeconds % 3600) / 60).toString();

  let waitForTime = `Waiting for ${days !== '0' ? days + ' days ' : ''}  ${
    hours !== '0' ? hours + ' hours ' : ''
  } ${minutes !== '0' ? minutes + ' minutes ' : ''}`;

  if (delayInSeconds === 0) {
    waitForTime = 'Not waiting';
  }
  return <div>{waitForTime}</div>;
};

export default Sequence;
