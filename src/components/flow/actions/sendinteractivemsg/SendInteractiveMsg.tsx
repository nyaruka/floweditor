import { SendInteractiveMsg } from 'flowTypes';
import * as React from 'react';

import i18n from 'config/i18n';
import { getMsgBody } from './helpers';
import { renderAssetList } from '../helpers';
import { AssetType } from 'store/flowContext';
import { MAX_TO_SHOW } from '../addlabels/AddLabels';

export const PLACEHOLDER = i18n.t(
  'actions.send_msg.placeholder',
  'Send interactive message to the contact'
);

const SendInteractiveMsgComp: React.SFC<SendInteractiveMsg> = (
  action: SendInteractiveMsg
): JSX.Element => {
  const message = JSON.parse(action.text);
  const body = getMsgBody(message);
  const endpoints: any = {};
  let labels = null;

  if (action.labels) {
    labels = renderAssetList(
      action.labels.map((label: any) => {
        if (label.name_match) {
          return {
            id: label.name_match,
            name: label.name_match,
            type: AssetType.NameMatch
          };
        }
        return {
          id: label.uuid,
          name: label.name,
          type: AssetType.Label
        };
      }),
      MAX_TO_SHOW,
      endpoints
    );
  }
  if (action.name) {
    return (
      <div>
        <div>
          <strong>{action.name}</strong>
        </div>
        <div>{body}</div>
        {labels}
      </div>
    );
  }

  return <div className="placeholder">{PLACEHOLDER}</div>;
};

export default SendInteractiveMsgComp;
