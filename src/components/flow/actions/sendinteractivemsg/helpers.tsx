/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import * as React from 'react';
import { Label, SendInteractiveMsg } from 'flowTypes';
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
    let { id, name } = action;

    const labels = action.labels
      ? action.labels.map((label: Label) => {
          if (label.name_match) {
            return { name: label.name_match, expression: true };
          }
          return label;
        })
      : [];

    return {
      interactives: { value: { id, interactive_content: {}, name } },
      labels: {
        value: labels
      },
      valid: true
    };
  }

  return {
    interactives: { value: '' },
    labels: {
      value: []
    },
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
    labels: state.labels.value.map((label: any) => {
      if (label.expression) {
        return { name_match: label.name };
      }
      return label;
    }),
    type: Types.send_interactive_msg,
    uuid: getActionUUID(settings, Types.send_interactive_msg)
  };

  return result;
};

export const getHeader = (message: any) => {
  let header;
  if (message) {
    if (message.type === 'list') {
      header = message.title;
    } else if (message.type === 'quick_reply') {
      if (message.content.type === 'text') {
        header = message.content.header;
      } else if (['image', 'video', 'file'].includes(message.content.type)) {
        header = '';
      }
    }
  }
  return header;
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
      } else if (['image', 'video', 'file'].includes(message.content.type)) {
        body = (
          <div className={styles.attachment}>
            <div className="fe-paperclip" />
            {message.content.text}
          </div>
        );
      }

      body = (
        <div>
          <div>{body}</div>
          {message.options.map((option: any) => (
            <div className={styles.listButton} key={option.title}>
              {option.title}
            </div>
          ))}
        </div>
      );
    }
  }
  return body;
};
