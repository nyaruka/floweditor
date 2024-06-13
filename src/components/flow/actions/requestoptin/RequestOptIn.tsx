import { RequestOptIn } from 'flowTypes';
import * as React from 'react';

const RequestOptInComp: React.SFC<RequestOptIn> = (action: RequestOptIn): JSX.Element => {
  return <div className="optin">{action.optin.name}</div>;
};

export default RequestOptInComp;
