/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import * as React from 'react';
import { SendInteractiveMsg } from 'flowTypes';
import { AssetStore } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';
import styles from './SendInteractiveMsg.module.scss';
import { ReactComponent as ButtonIcon } from './icons/button.svg';

import { SendInteractiveMsgFormState } from './SendInteractiveMsgForm';

export const initializeForm = (
  settings: NodeEditorSettings,
  assetStore: AssetStore
): SendInteractiveMsgFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.send_interactive_msg) {
    const action = settings.originalAction as SendInteractiveMsg;
    let { id, text, name } = action;
    text = JSON.parse(text);
    return {
      interactives: { value: { id, interactive_content: text, name } },
      valid: true
    };
  }

  return {
    interactives: { value: '' },
    valid: false
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: SendInteractiveMsgFormState
): SendInteractiveMsg => {
  const result: SendInteractiveMsg = {
    id: state.interactives.value.id,
    text: JSON.stringify(state.interactives.value.interactive_content),
    name: state.interactives.value.name,
    type: Types.send_interactive_msg,
    uuid: getActionUUID(settings, Types.send_msg)
  };

  return result;
};

export const getMsgBody = (message: any) => {
  let body;
  if (message) {
    if (message.type === 'list') {
      body = (
        <div>
          <div>{message.body}</div>
          <div className={styles.listButton}>
            <ButtonIcon />
            {message.globalButtons[0].title}
          </div>
        </div>
      );
    } else if (message.type === 'quick_reply') {
      if (message.content.type === 'text') {
        body = message.content.text;
      } else if (['image', 'video'].includes(message.content.type)) {
        body = message.content.caption;
      }

      body = (
        <div>
          <div>{body}</div>
          {message.options.map((option: any) => (
            <div className={styles.listButton}>{option.title}</div>
          ))}
        </div>
      );
    }
  }
  return body;
};
