import { v4 as generateUUID } from 'uuid';
import { createRenderNode } from '~/components/flow/routers/helpers';
import { WebhookRouterFormState } from '~/components/flow/routers/webhook/WebhookRouterForm';
import { DEFAULT_BODY } from '~/components/nodeeditor/constants';
import { Operators } from '~/config/operatorConfigs';
import { Types } from '~/config/typeConfigs';
import {
    CallWebhook,
    Case,
    Exit,
    RouterTypes,
    SwitchRouter,
    UINodeTypes,
    WebhookExitNames
} from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';

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

export const nodeToState = (settings: NodeEditorSettings): WebhookRouterFormState => {
    const state: WebhookRouterFormState = {
        type: Types.call_webhook,
        headers: [
            {
                value: {
                    uuid: generateUUID(),
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

    if (settings.originalAction && settings.originalAction.type === Types.call_webhook) {
        const action = settings.originalAction as CallWebhook;

        // add in our headers
        for (const name of Object.keys(action.headers)) {
            state.headers.unshift({
                value: {
                    uuid: generateUUID(),
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

    let uuid = generateUUID();
    if (settings.originalAction && settings.originalAction.type === Types.call_webhook) {
        uuid = settings.originalAction.uuid;
    }

    const newAction: CallWebhook = {
        uuid,
        headers,
        type: Types.call_webhook,
        url: state.url.value,
        method: state.method.value.value as Methods,
        body: state.postBody.value
    };

    const exits: Exit[] = [];
    let cases: Case[] = [];

    const renderNode = settings.originalNode;

    // If we were already a webhook, lean on those exits and cases
    if (renderNode && renderNode.ui.type === 'webhook') {
        settings.originalNode.node.exits.forEach((exit: any) => exits.push(exit));
        (settings.originalNode.node.router as SwitchRouter).cases.forEach(kase => cases.push(kase));
    } else {
        // Otherwise, let's create some new ones
        exits.push(
            {
                uuid: generateUUID(),
                name: WebhookExitNames.Success,
                destination_node_uuid: null
            },
            {
                uuid: generateUUID(),
                name: WebhookExitNames.Failure,
                destination_node_uuid: null
            },
            {
                uuid: generateUUID(),
                name: WebhookExitNames.Unreachable,
                destination_node_uuid: null
            }
        );

        cases = [
            {
                uuid: generateUUID(),
                type: Operators.is_text_eq,
                arguments: ['run.webhook.status', 'success'],
                exit_uuid: exits[0].uuid
            },
            {
                uuid: generateUUID(),
                type: Operators.is_text_eq,
                arguments: ['run.webhook.status', 'response_error'],
                exit_uuid: exits[1].uuid
            },
            {
                uuid: generateUUID(),
                type: Operators.is_text_eq,
                arguments: ['run.webhook.status', 'connection_error'],
                exit_uuid: exits[2].uuid
            }
        ];
    }

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        operand: '@webhook',
        cases,
        default_exit_uuid: exits[1].uuid
    };

    return createRenderNode(settings.originalNode.node.uuid, router, exits, UINodeTypes.webhook, [
        newAction
    ]);
};
