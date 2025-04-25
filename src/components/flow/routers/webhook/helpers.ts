import { createServiceCallSplitNode } from 'components/flow/routers/helpers';
import { WebhookRouterFormState } from 'components/flow/routers/webhook/WebhookRouterForm';
import { DEFAULT_BODY } from 'components/nodeeditor/constants';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { CallWebhook } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';

export enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  PATCH = 'PATCH'
}

export interface MethodOption {
  value: string;
  name: string;
}

interface HeaderMap {
  [name: string]: string;
}

export const GET_METHOD: MethodOption = {
  value: Methods.GET,
  name: Methods.GET
};

export const METHOD_OPTIONS: MethodOption[] = [
  GET_METHOD,
  { value: Methods.POST, name: Methods.POST },
  { value: Methods.PUT, name: Methods.PUT },
  { value: Methods.DELETE, name: Methods.DELETE },
  { value: Methods.HEAD, name: Methods.HEAD },
  { value: Methods.PATCH, name: Methods.PATCH }
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
  const router = settings.originalNode.node.router as SwitchRouter;
  const resultName: StringEntry = { value: '' };

  const state: WebhookRouterFormState = {
    headers: [],
    resultName,
    method: { value: GET_METHOD },
    url: { value: '' },
    body: { value: getDefaultBody(Methods.GET) },
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

    state.resultName = { value: action.result_name || router.result_name || '' };
    state.url = { value: action.url };
    state.method = { value: { name: action.method, value: action.method } };
    state.body = { value: action.body };
    state.valid = true;
  } else {
    state.headers.push({
      value: {
        uuid: createUUID(),
        name: 'Accept',
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
    body: state.body.value,
    method: state.method.value.value as Methods
  };

  // if the action had the result name, keep the result on the action rather than the router
  if (originalAction && originalAction.result_name) {
    newAction.result_name = state.resultName.value;
  }

  return createServiceCallSplitNode(
    newAction,
    settings.originalNode,
    '@webhook.status',
    Operators.has_number_between,
    ['200', '299'],
    newAction.result_name ? '' : state.resultName.value // put result on router if not on action
  );
};

export const getDefaultBody = (method: string): string => {
  return method === Methods.GET ? '' : DEFAULT_BODY;
};
