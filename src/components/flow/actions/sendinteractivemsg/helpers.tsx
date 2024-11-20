/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getActionUUID } from 'components/flow/actions/helpers';
import { Operators, Types } from 'config/interfaces';
import * as React from 'react';
import { Label, SendInteractiveMsg } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';
import styles from './SendInteractiveMsg.module.scss';
import { ReactComponent as ButtonIcon } from './icons/button.svg';

import { SendInteractiveMsgFormState } from './SendInteractiveMsgForm';
import { createUUID } from 'utils';
import { stateToNode } from 'components/flow/routers/response/helpers';
import { AssetStore, RenderNode } from 'store/flowContext';

export const initializeForm = (settings: NodeEditorSettings): SendInteractiveMsgFormState => {
  if (settings.originalAction && settings.originalAction.type === Types.send_interactive_msg) {
    const action = settings.originalAction as SendInteractiveMsg;
    let { id, name, expression, params, paramsCount } = action;
    const interactive_content = JSON.parse(action.text);

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
      interactives: { value: { id, interactive_content, name } },
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

export const stateToRouter = (
  settings: NodeEditorSettings,
  state: SendInteractiveMsgFormState,
  assetStore: AssetStore
): RenderNode => {
  let cases = [];
  const translations = state.interactives.value.translations;
  console.log(translations);

  const content = state.interactives.value.interactive_content;
  let options = [''];
  if (content) {
    if (content.type === 'quick_reply')
      content.options.forEach((option: any) => {
        options.push(option.title);
      });

    if (content.type === 'list') {
      content.items.forEach((item: any) => {
        item.options.forEach((option: any) => {
          options.push(option.title);
        });
      });
    }
    if (content.type === 'location_request_message') {
      const uuid = createUUID();
      const values: any = {
        uuid,
        categoryName: `Has location`,
        kase: {
          arguments: [],
          type: Operators.has_location,
          uuid,
          category_uuid: null
        },
        valid: true
      };
      cases.push(values);
    }
  }
  const generateCases = options.map((option: string, index: number) => {
    const uuid = createUUID();
    const values: any = {
      uuid,
      categoryName: `${option.charAt(0).toUpperCase()}${option.slice(1)}`,
      kase: {
        arguments: [option],
        type: Operators.has_any_word,
        uuid,
        category_uuid: null
      },
      valid: true,
      translations: {}
    };
    if (option) {
      values.translations = Object.keys(translations).reduce((acc: any, lang: any) => {
        const translation = translations[lang];

        if (translation.type === 'list') {
          const matchedOption = translation.items.flatMap((item: any) => item.options)[index - 1];

          if (matchedOption) {
            acc[lang] = {
              arguments: [matchedOption.title]
            };
          }
        } else if (translation.type === 'quick_reply') {
          acc[lang] = {
            arguments: [translation.options[index - 1].title]
          };
        }

        return acc;
      }, {});
    }

    return values;
  });

  cases = cases.concat(generateCases);

  let result: any = {
    cases,
    resultName: {
      value: ''
    },
    timeout: -1,
    expression: '',
    valid: true
  };

  let renderedNode;

  if (settings.originalNode.ghost) {
    renderedNode = stateToNode(settings, result, assetStore);
  } else {
    if (settings.originalNode.node.exits[0].destination_uuid) {
      settings = {
        ...settings,
        originalNode: {
          ...settings.originalNode,
          node: {
            ...settings.originalNode.node,
            uuid: settings.originalNode.node.exits[0].destination_uuid
          }
        }
      };
    }
    renderedNode = stateToNode(settings, result, assetStore);
  }

  return renderedNode;
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
