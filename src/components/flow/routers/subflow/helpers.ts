import { createRenderNode } from '~/components/flow/routers/helpers';
import { SubflowRouterFormState } from '~/components/flow/routers/subflow/SubflowRouterForm';
import { Operators } from '~/config/operatorConfigs';
import { Types } from '~/config/typeConfigs';
import {
    Case,
    Exit,
    Flow,
    RouterTypes,
    StartFlow,
    StartFlowExitNames,
    SwitchRouter
} from '~/flowTypes';
import { Asset, AssetType } from '~/services/AssetService';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';
import { createUUID } from '~/utils';

export const nodeToState = (settings: NodeEditorSettings): SubflowRouterFormState => {
    if (settings.originalNode.ui.type === Types.split_by_subflow) {
        const action = (settings.originalAction ||
            (settings.originalNode.node.actions.length > 0 &&
                settings.originalNode.node.actions[0])) as StartFlow;

        return { flow: { value: flowToAsset(action.flow) }, valid: true };
    }

    return {
        flow: { value: null },
        valid: false
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: SubflowRouterFormState
): RenderNode => {
    const action =
        settings.originalAction ||
        (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

    const newAction: StartFlow = {
        uuid: action.uuid || createUUID(),
        type: Types.start_flow,
        flow: assetToFlow(state.flow.value)
    };

    // If we're already a subflow, lean on those exits and cases
    let exits: Exit[];
    let cases: Case[];

    if (settings.originalNode.ui.type === Types.split_by_subflow) {
        ({ exits } = settings.originalNode.node);
        ({ cases } = settings.originalNode.node.router as SwitchRouter);
    } else {
        // Otherwise, let's create some new ones
        exits = [
            {
                uuid: createUUID(),
                name: StartFlowExitNames.Complete,
                destination_node_uuid: null
            },
            {
                uuid: createUUID(),
                name: StartFlowExitNames.Expired,
                destination_node_uuid: null
            }
        ];

        cases = [
            {
                uuid: createUUID(),
                type: Operators.is_text_eq,
                arguments: ['child.run.status', 'completed'],
                exit_uuid: exits[0].uuid
            },
            {
                uuid: createUUID(),
                arguments: ['child.run.status', 'expired'],
                type: Operators.is_text_eq,
                exit_uuid: exits[1].uuid
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
        Types.split_by_subflow,
        [newAction]
    );

    return newRenderNode;
};

const flowToAsset = (field: Flow = { uuid: '', name: '' }): Asset => ({
    id: field.uuid,
    name: field.name,
    type: AssetType.Flow
});

const assetToFlow = (asset: Asset): Flow => ({
    uuid: asset.id,
    name: asset.name
});
