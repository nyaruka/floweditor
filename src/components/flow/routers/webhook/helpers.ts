import { createWebhookBasedNode } from 'components/flow/routers/helpers';
import { WebhookRouterFormState } from 'components/flow/routers/webhook/WebhookRouterForm';
import { DEFAULT_BODY } from 'components/nodeeditor/constants';
import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { CallWebhook } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';

export enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT'
}

export interface MethodOption {
  value: string;
  label: string;
}

interface HeaderMap {
  [name: string]: string;
}

export const GET_METHOD: MethodOption = {
  value: Methods.GET,
  label: Methods.GET
};

export const METHOD_OPTIONS: MethodOption[] = [
  GET_METHOD,
  { value: Methods.POST, label: Methods.POST },
  { value: Methods.PUT, label: Methods.PUT }
];

export const getOriginalAction = (settings: NodeEditorSettings): CallWebhook => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.call_webhook) {
    return action as CallWebhook;
  }
};

export const nodeToState = (settings: NodeEditorSettings): WebhookRouterFormState => {
  // TODO: work out an incremental result name
  const resultName: StringEntry = { value: 'Result' };

  const state: WebhookRouterFormState = {
    headers: [],
    resultName,
    method: { value: GET_METHOD },
    url: { value: '' },
    postBody: { value: DEFAULT_BODY },
    valid: false
  };

  if (getType(settings.originalNode) === Types.split_by_webhook) {
    const action = getOriginalAction(settings) as CallWebhook;

    // add in our headers
    for (const name of Object.keys(action.headers || []).sort()) {
      state.headers.push({
        value: {
          uuid: createUUID(),
          value: action.headers[name],
          name
        }
      });
    }

    state.resultName = { value: action.result_name };
    state.url = { value: action.url };
    state.method = { value: { label: action.method, value: action.method } };
    state.postBody = { value: action.body };
    state.valid = true;
  } else {
    state.headers.push({
      value: {
        uuid: createUUID(),
        name: 'Content-Type',
        value: 'application/json'
      }
    });
  }

  // one empty header
  state.headers.push({
    value: {
      uuid: createUUID(),
      name: '',
      value: ''
    }
  });

  return state;
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: WebhookRouterFormState
): RenderNode => {
  const headers: HeaderMap = {};

  for (const entry of state.headers) {
    if (entry.value.name.trim().length !== 0) {
      headers[entry.value.name] = entry.value.value;
    }
  }

  let uuid = createUUID();

  const originalAction = getOriginalAction(settings);
  if (originalAction) {
    uuid = originalAction.uuid;
  }

  const newAction: CallWebhook = {
    uuid,
    headers,
    type: Types.call_webhook,
    url: state.url.value,
    method: state.method.value.value as Methods,
    result_name: state.resultName.value
  };

  // include the body if we aren't a get
  if (newAction.method !== Methods.GET) {
    newAction.body = state.postBody.value;
  }

  return createWebhookBasedNode(newAction, settings.originalNode, false);
};
