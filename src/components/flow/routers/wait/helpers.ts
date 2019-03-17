import { createRenderNode, resolveExits } from '~/components/flow/routers/helpers';
import { WaitRouterFormState } from '~/components/flow/routers/wait/WaitRouterForm';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Types, Type } from '~/config/interfaces';
import { Router, RouterTypes, SwitchRouter, Wait, WaitTypes, HintTypes } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

export const nodeToState = (settings: NodeEditorSettings): WaitRouterFormState => {
    let resultName: StringEntry = { value: 'Result' };
    if (settings.originalNode && settings.originalNode.ui.type === Types.wait_for_response) {
        const router = settings.originalNode.node.router as SwitchRouter;
        if (router) {
            resultName = { value: router.result_name || '' };
        }
    }

    return {
        resultName,
        valid: true
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: WaitRouterFormState,
    typeConfig: Type
): RenderNode => {
    const { exits, defaultExit } = resolveExits([], false, settings);

    const optionalRouter: Pick<Router, 'result_name'> = {};
    if (state.resultName.value) {
        optionalRouter.result_name = state.resultName.value;
    }

    // TODO: shouldnt have an operand
    const router: SwitchRouter = {
        type: RouterTypes.switch,
        default_exit_uuid: defaultExit,
        cases: [],
        operand: DEFAULT_OPERAND,
        ...optionalRouter
    };

    const wait = { type: WaitTypes.msg } as Wait;

    switch (typeConfig.type) {
        case Types.wait_for_audio:
            wait.hint = { type: HintTypes.audio };
            break;
        case Types.wait_for_image:
            wait.hint = { type: HintTypes.image };
            break;
        case Types.wait_for_location:
            wait.hint = { type: HintTypes.location };
            break;
        case Types.wait_for_video:
            wait.hint = { type: HintTypes.video };
            break;
    }

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.wait_for_response,
        [],
        wait
    );

    return newRenderNode;
};
