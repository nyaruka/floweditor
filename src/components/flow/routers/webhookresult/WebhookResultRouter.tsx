import * as React from 'react';

import { Delay } from 'flowTypes';

const wordsBasedOnTime = (time: number, type: string) => {
  return time > 0 ? time + (time > 1 ? ` ${type}s ` : ` ${type} `) : '';
};

const WebhookResultRouter: React.SFC<Delay> = (action: Delay): JSX.Element => {
  const delayInSeconds = parseInt(action.delay ? action.delay : '0');

  const days = Math.floor(delayInSeconds / (3600 * 24));
  const noOfDays = wordsBasedOnTime(days, 'day');

  const hours = Math.floor((delayInSeconds % (3600 * 24)) / 3600);
  const noOfHours = wordsBasedOnTime(hours, 'hour');

  const minutes = Math.floor((delayInSeconds % 3600) / 60);
  const noOfMinutes = wordsBasedOnTime(minutes, 'minute');

  const waitForTime = `Waiting for ${noOfDays} ${noOfHours} ${noOfMinutes}`;

  return <div>{waitForTime}</div>;
};

export default WebhookResultRouter;
