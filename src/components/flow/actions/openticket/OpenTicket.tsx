import * as React from 'react';
import { OpenTicket } from 'flowTypes';
import { fakePropType } from 'config/ConfigProvider';

const OpenTicketComp: React.SFC<OpenTicket> = ({ subject, topic }, context: any): JSX.Element => {
  return (
    <div>
      <div>{subject ? subject : topic ? topic.name : null}</div>
    </div>
  );
};

OpenTicketComp.contextTypes = {
  config: fakePropType
};

export default OpenTicketComp;
