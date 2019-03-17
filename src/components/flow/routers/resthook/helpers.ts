import { createRenderNode } from '~/components/flow/routers/helpers';
import { Operators } from '~/config/interfaces';
import { Types } from '~/config/interfaces';
import { CallResthook, Case, Exit, RouterTypes, SwitchRouter, WebhookExitNames } from '~/flowTypes';
import { AssetType, RenderNode } from '~/store/flowContext';
import { AssetEntry, NodeEditorSettings } from '~/store/nodeEditor';
import { createUUID } from '~/utils';

import { ResthookRouterFormState } from './ResthookRouterForm';

export const nodeToState = (settings: NodeEditorSettings): ResthookRouterFormState => {
    const originalAction = getOriginalAction(settings);

    let resthookAsset: AssetEntry = { value: null };
    if (originalAction) {
        const resthook = originalAction.resthook;
        resthookAsset = { value: { id: resthook, name: resthook, type: AssetType.Resthook } };
    }

    return {
        resthook: resthookAsset,
        valid: false
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: ResthookRouterFormState
): RenderNode => {
    let uuid = createUUID();
    const originalAction = getOriginalAction(settings);
    if (originalAction) {
        uuid = originalAction.uuid;
    }

    const newAction: CallResthook = {
        uuid,
        resthook: state.resthook.value.id,
        type: Types.call_resthook
    };

    // If we're already a subflow, lean on those exits and cases
    let exits: Exit[];
    let cases: Case[];

    if (originalAction) {
        ({ exits } = settings.originalNode.node);
        ({ cases } = settings.originalNode.node.router as SwitchRouter);
    } else {
        // Otherwise, let's create some new ones
        // Otherwise, let's create some new ones
        exits = [
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
        ];

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
        operand: '@child',
        cases,
        default_exit_uuid: null
    };

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.split_by_resthook,
        [newAction]
    );

    return newRenderNode;
};

export const getOriginalAction = (settings: NodeEditorSettings): CallResthook => {
    const action =
        settings.originalAction ||
        (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

    if (action.type === Types.call_resthook) {
        return action as CallResthook;
    }
};
