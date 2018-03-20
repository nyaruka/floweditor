import * as React from 'react';
import { SendEmail } from '../../../flowTypes';

const SendEmailComp: React.SFC<SendEmail> = ({ subject }): JSX.Element => <>{subject}</>;

export default SendEmailComp;
