import * as React from 'react';
import { OpenTicket } from 'flowTypes';
import { renderAsset } from '../helpers';
import { AssetType } from 'store/flowContext';
import { fakePropType } from 'config/ConfigProvider';

const OpenTicketComp: React.SFC<OpenTicket> = ({ ticketer }, context: any): JSX.Element => {
  return renderAsset(
    {
      id: ticketer.uuid,
      name: ticketer.name,
      type: AssetType.Ticketer
    },
    context.config.endpoints
  );
};

OpenTicketComp.contextTypes = {
  config: fakePropType
};

export default OpenTicketComp;
