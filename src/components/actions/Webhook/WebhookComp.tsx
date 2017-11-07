import * as React from 'react';
import { IWebhook } from '../../../flowTypes';
import withAction from '../../enhancers/withAction';

export const WebhookCompBase = ({ url }: IWebhook) => <div>{url}</div>;

export default withAction()(WebhookCompBase);
