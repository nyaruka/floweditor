import * as React from 'react';
import { SendEmail } from '../../../flowTypes';

const SendEmailComp: React.SFC<SendEmail> = ({ subject }): JSX.Element => (
    <React.Fragment>{subject}</React.Fragment>
);

export default SendEmailComp;
