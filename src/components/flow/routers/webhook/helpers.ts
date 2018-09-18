import { createRenderNode } from '~/components/flow/routers/helpers';
import { WebhookRouterFormState } from '~/components/flow/routers/webhook/WebhookRouterForm';
import { DEFAULT_BODY } from '~/components/nodeeditor/constants';
import { Operators } from '~/config/operatorConfigs';
import { Types } from '~/config/typeConfigs';
import { CallWebhook, Case, Exit, RouterTypes, SwitchRouter, WebhookExitNames } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';
import { createUUID } from '~/utils';

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

export const GET_METHOD: MethodOption = { value: Methods.GET, label: Methods.GET };

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
    const state: WebhookRouterFormState = {
        headers: [
            {
                value: {
                    uuid: createUUID(),
                    name: '',
                    value: ''
                }
            }
        ],
        method: { value: GET_METHOD },
        url: { value: '' },
        postBody: { value: DEFAULT_BODY },
        valid: false
    };

    if (settings.originalNode.ui.type === Types.split_by_webhook) {
        const action = getOriginalAction(settings);

        // add in our headers
        for (const name of Object.keys(action.headers || [])) {
            state.headers.unshift({
                value: {
                    uuid: createUUID(),
                    value: action.headers[name],
                    name
                }
            });
        }

        state.url = { value: action.url };
        state.method = { value: { label: action.method, value: action.method } };
        state.postBody = { value: action.body };
    }

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
        method: state.method.value.value as Methods
    };

    // include the body if we aren't a get
    if (newAction.method !== Methods.GET) {
        newAction.body = state.postBody.value;
    }

    const exits: Exit[] = [];
    let cases: Case[] = [];

    // If we were already a webhook, lean on those exits and cases
    if (originalAction) {
        settings.originalNode.node.exits.forEach((exit: any) => exits.push(exit));
        (settings.originalNode.node.router as SwitchRouter).cases.forEach(kase => cases.push(kase));
    } else {
        // Otherwise, let's create some new ones
        exits.push(
            {
                uuid: createUUID(),
                name: WebhookExitNames.Success,
                destination_node_uuid: null
            },
            {
                uuid: createUUID(),
                name: WebhookExitNames.Failure,
                destination_node_uuid: null
            },
            {
                uuid: createUUID(),
                name: WebhookExitNames.Unreachable,
                destination_node_uuid: null
            }
        );

        cases = [
            {
                uuid: createUUID(),
                type: Operators.has_webhook_status,
                arguments: ['success'],
                exit_uuid: exits[0].uuid
            },
            {
                uuid: createUUID(),
                type: Operators.has_webhook_status,
                arguments: ['response_error'],
                exit_uuid: exits[1].uuid
            },
            {
                uuid: createUUID(),
                type: Operators.has_webhook_status,
                arguments: ['connection_error'],
                exit_uuid: exits[2].uuid
            }
        ];
    }

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        operand: '@run.webhook',
        cases,
        default_exit_uuid: exits[1].uuid
    };

    return createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.split_by_webhook,
        [newAction]
    );
};
