/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import * as React from 'react';
import { Label, SendInteractiveMsg } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';
import styles from './SendInteractiveMsg.module.scss';
import { ReactComponent as ButtonIcon } from './icons/button.svg';

import { SendInteractiveMsgFormState } from './SendInteractiveMsgForm';

export const initializeForm = (settings: NodeEditorSettings): SendInteractiveMsgFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.send_interactive_msg) {
    const action = settings.originalAction as SendInteractiveMsg;
    let { id, name, expression, params, paramsCount } = action;

    const labels = action.labels
      ? action.labels.map((label: Label) => {
          if (label.name_match) {
            return { name: label.name_match, expression: true };
          }
          return label;
        })
      : [];

    const listValues = params
      ? params.map((param: string) => {
          return { value: param };
        })
      : [];

    while (listValues.length < 10) {
      listValues.push({ value: { id: '', label: '' } });
    }

    const returnValue: SendInteractiveMsgFormState = {
      interactives: { value: { id, interactive_content: {}, name } },
      labels: {
        value: labels
      },
      valid: true,
      listValues,
      listValuesCount: paramsCount,
      attachment_url: { value: action.attachment_url || '' },
      attachment_type: { value: action.attachment_type || '' }
    };

    if (paramsCount) {
      returnValue.isChecked = true;
    }

    if (expression || expression === '') {
      returnValue.expression = {
        value: expression
      };
    }

    return returnValue;
  }

  return {
    isChecked: false,
    expression: null,
    interactives: { value: '' },
    labels: {
      value: []
    },
    listValues: Array(10).fill({ value: { id: '', label: '' } }),
    valid: false,
    listValuesCount: '',
    attachment_url: { value: '' },
    attachment_type: { value: '' }
  };
};

export const stateToAction = (
  settings: NodeEditorSettings,
  state: SendInteractiveMsgFormState
): SendInteractiveMsg => {
  let result: any = {};

  const params = state.listValues
    .filter(listItem => listItem.value.label !== '')
    .map(listItem => listItem.value);

  const paramsCount = state.listValuesCount;

  if (state.expression) {
    result = {
      params,
      paramsCount,
      name: state.interactives.value.name,
      expression: state.expression.value,
      type: Types.send_interactive_msg,
      uuid: getActionUUID(settings, Types.send_interactive_msg)
    };
    return result;
  }

  result = {
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

  if (state.isChecked) {
    result.params = params;
    result.paramsCount = paramsCount;
  }

  if (state.attachment_type) {
    result.attachment_type = state.attachment_type.value;
  }
  if (state.attachment_url) {
    result.attachment_url = state.attachment_url.value;
  }

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
    } else if (message.type === 'location_request_message') {
      body = (
        <div>
          <span className="fe-map-marker" />
          {message.body.text}
        </div>
      );
    }
  }
  return body;
};
