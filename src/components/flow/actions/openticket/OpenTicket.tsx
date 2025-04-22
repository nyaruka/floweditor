import * as React from 'react';
import { OpenTicket } from 'flowTypes';
import { fakePropType } from 'config/ConfigProvider';

const OpenTicketComp: React.SFC<OpenTicket> = ({ topic }, context: any): JSX.Element => {
  return (
    <div>
      <div>{topic ? topic.name : null}</div>
    </div>
  );
};

OpenTicketComp.contextTypes = {
  config: fakePropType
};

export default OpenTicketComp;
