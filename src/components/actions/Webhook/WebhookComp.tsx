import * as React from 'react';
import { ICallWebhook } from '../../../flowTypes';
import withAction from '../../enhancers/withAction';

export const WebhookCompBase = ({ url }: ICallWebhook) => <div>{url}</div>;

export default withAction()(WebhookCompBase);
