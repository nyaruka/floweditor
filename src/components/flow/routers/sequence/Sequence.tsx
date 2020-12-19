import Pill from 'components/pill/Pill';
import * as React from 'react';

import styles from './SendMsg.module.scss';
import i18n from 'config/i18n';
import { Delay } from 'flowTypes';

const Sequence: React.SFC<Delay> = (action: Delay): JSX.Element => {
  const delayInSeconds = parseInt(action.delay ? action.delay : '0');
  const days = Math.floor(delayInSeconds / (3600 * 24));
  const noOfDays = days > 0 ? days + (days > 1 ? ' days ' : ' day ') : '';

  const hours = Math.floor((delayInSeconds % (3600 * 24)) / 3600);
  const noOfHours = hours > 0 ? hours + (hours > 1 ? ' hours ' : ' hour ') : '';

  const minutes = Math.floor((delayInSeconds % 3600) / 60);
  const noOfMinutes = minutes > 0 ? minutes + (minutes > 1 ? ' minutes ' : ' minute ') : '';

  let waitForTime = `Waiting for ${noOfDays} ${noOfHours} ${noOfMinutes}`;

  if (delayInSeconds === 0) {
    waitForTime = 'Not waiting';
  }
  return <div>{waitForTime}</div>;
};

export default Sequence;
