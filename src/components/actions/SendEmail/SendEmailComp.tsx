import * as React from 'react';
import { ISendEmail } from '../../../flowTypes';
import withAction from '../../enhancers/withAction';

export const SendEmailCompBase = ({ subject }: ISendEmail) => <div>{subject}</div>;

export default withAction()(SendEmailCompBase);
