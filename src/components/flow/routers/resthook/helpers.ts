import { createRenderNode } from '~/components/flow/routers/helpers';
import { Operators } from '~/config/interfaces';
import { Types } from '~/config/interfaces';
import {
    CallResthook,
    Case,
    Exit,
    RouterTypes,
    SwitchRouter,
    WebhookExitNames,
    Category
} from '~/flowTypes';
import { AssetType, RenderNode } from '~/store/flowContext';
import { AssetEntry, NodeEditorSettings } from '~/store/nodeEditor';
import { createUUID } from '~/utils';

import { ResthookRouterFormState } from './ResthookRouterForm';
import { WEBHOOK_OPERAND } from '~/components/nodeeditor/constants';

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
    let categories: Category[];

    if (originalAction) {
        ({ exits } = settings.originalNode.node);
        ({ cases, categories } = settings.originalNode.node.router as SwitchRouter);
    } else {
        // Otherwise, let's create some new ones
        exits = [
            {
                uuid: createUUID(),
                destination_uuid: null
            },
            {
                uuid: createUUID(),
                destination_uuid: null
            },
            {
                uuid: createUUID(),
                destination_uuid: null
            }
        ];

        categories = [
            {
                uuid: createUUID(),
                name: WebhookExitNames.Success,
                exit_uuid: exits[0].uuid
            },
            {
                uuid: createUUID(),
                name: WebhookExitNames.Failure,
                exit_uuid: exits[1].uuid
            },
            {
                uuid: createUUID(),
                name: WebhookExitNames.Unreachable,
                exit_uuid: exits[2].uuid
            }
        ];

        cases = [
            {
                uuid: createUUID(),
                type: Operators.has_webhook_status,
                arguments: ['success'],
                category_uuid: categories[0].uuid
            },
            {
                uuid: createUUID(),
                type: Operators.has_webhook_status,
                arguments: ['response_error'],
                category_uuid: categories[1].uuid
            },
            {
                uuid: createUUID(),
                type: Operators.has_webhook_status,
                arguments: ['connection_error'],
                category_uuid: categories[2].uuid
            }
        ];
    }

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        operand: WEBHOOK_OPERAND,
        cases,
        categories,
        default_category_uuid: null
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
