import { SendInteractiveMsg } from 'flowTypes';
import React, { useEffect, useState } from 'react';

import i18n from 'config/i18n';
import { getHeader, getMsgBody } from './helpers';
import { renderAssetList } from '../helpers';
import { AssetType } from 'store/flowContext';
import { MAX_TO_SHOW } from '../addlabels/AddLabels';
import AppState from 'store/state';
import { connect } from 'react-redux';
import { getAsset } from 'external';
import Loading from 'components/loading/Loading';
import { addAsset, DispatchWithState } from 'store/thunks';
import { bindActionCreators } from 'redux';

export const PLACEHOLDER = i18n.t(
  'actions.send_interactive_msg.placeholder',
  'The interactive message is not available'
);

const SendInteractiveMsgComp: React.SFC<SendInteractiveMsg> = ({
  assetStore,
  labels,
  language,
  id,
  addAsset,
  expression
}: SendInteractiveMsg): JSX.Element => {
  const [body, setBody] = useState(null);
  const [header, setHeader] = useState(null);
  const { endpoint, type, items } = assetStore.interactives;

  console.log(expression);
  let languageId = language.id;

  if (language.id === 'base') {
    languageId = 'en';
  }

  const interactive: any = items[id];

  useEffect(() => {
    setHeader(null);
    setBody(null);

    const setNode = (content: any) => {
      let message = content.translations[languageId];
      message = message ? message : content.interactive_content;
      setBody(getMsgBody(message));
      setHeader(getHeader(message));
    };

    if (interactive) {
      setNode(interactive);
    } else if (expression || expression === '') {
      setBody('Expressions used here');
    } else {
      getAsset(endpoint, type, id.toString()).then(response => {
        if (response.error) {
          setBody(PLACEHOLDER);
        } else {
          addAsset('interactives', response);
          setNode(response);
        }
      });
    }
  }, [language, id]);

  const endpoints: any = {};
  let labelsList = null;

  if (labels) {
    labelsList = renderAssetList(
      labels.map((label: any) => {
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
      {labelsList}
    </div>
  );
};

const mapStateToProps = ({ flowContext: { assetStore }, editorState: { language } }: AppState) => ({
  assetStore,
  language
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators(
    {
      addAsset
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendInteractiveMsgComp);
