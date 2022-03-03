import { SendInteractiveMsg } from 'flowTypes';
import * as React from 'react';

import i18n from 'config/i18n';
import { getHeader, getMsgBody } from './helpers';
import { renderAssetList } from '../helpers';
import { AssetType } from 'store/flowContext';
import { MAX_TO_SHOW } from '../addlabels/AddLabels';
import AppState from 'store/state';
import { connect } from 'react-redux';
import { getAsset } from 'external';
import Loading from 'components/loading/Loading';

const languageToId: any = {
  en: 1,
  hi: 2,
  ta: 3,
  kn: 4,
  ml: 5,
  te: 6,
  or: 7,
  as: 8,
  gu: 9,
  bn: 10,
  pa: 11,
  mr: 12,
  ur: 13,
  es: 14,
  isl: 15
};

export const PLACEHOLDER = i18n.t(
  'actions.send_interactive_msg.placeholder',
  'The interactive message in not available'
);

const SendInteractiveMsgComp: React.SFC<SendInteractiveMsg> = (
  action: SendInteractiveMsg
): JSX.Element => {
  const [body, setBody] = React.useState(null);
  const [header, setHeader] = React.useState(null);

  React.useEffect(() => {
    setHeader(null);
    setBody(null);
    const { endpoint, type } = action.assetStore.interactives;

    getAsset(endpoint, type, action.id.toString()).then(res => {
      if (res.error) {
        setBody(PLACEHOLDER);
      } else {
        let languageId = languageToId[action.language.id];

        if (action.language.id === 'base') {
          languageId = 1;
        }

        let message = res.translations[languageId];
        message = message ? message : res.interactive_content;

        setBody(getMsgBody(message));
        setHeader(getHeader(message));
      }
    });
  }, [action.language]);

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
  return (
    <div>
      <div>
        <strong>{header}</strong>
      </div>
      <div>{body ? body : <Loading units={5} color="#3498db" size={7} />}</div>
      {labels}
    </div>
  );
};

const mapStateToProps = ({ flowContext: { assetStore }, editorState: { language } }: AppState) => ({
  assetStore,
  language
});

export default connect(mapStateToProps)(SendInteractiveMsgComp);
