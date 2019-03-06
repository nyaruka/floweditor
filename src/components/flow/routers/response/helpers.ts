import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import {
    createCaseProps,
    createRenderNode,
    hasCases,
    resolveExits
} from '~/components/flow/routers/helpers';
import ResponseRouterForm, {
    ResponseRouterFormState
} from '~/components/flow/routers/response/ResponseRouterForm';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Types } from '~/config/interfaces';
import { Router, RouterTypes, SwitchRouter, Wait, WaitTypes } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

export const nodeToState = (settings: NodeEditorSettings): ResponseRouterFormState => {
    let initialCases: CaseProps[] = [];

    // TODO: work out an incremental result name
    let resultName: StringEntry = { value: 'Result' };
    let timeout = 0;

    if (settings.originalNode && settings.originalNode.ui.type === Types.wait_for_response) {
        const router = settings.originalNode.node.router as SwitchRouter;
        if (router) {
            if (hasCases(settings.originalNode.node)) {
                initialCases = createCaseProps(router.cases, settings.originalNode.node.exits);
            }

            resultName = { value: router.result_name || '' };
        }

        if (settings.originalNode.node.wait) {
            timeout = settings.originalNode.node.wait.timeout;
        }
    }

    return {
        cases: initialCases,
        resultName,
        timeout,
        valid: true
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: ResponseRouterFormState
): RenderNode => {
    const { cases, exits, defaultExit } = resolveExits(state.cases, state.timeout > 0, settings);

    const optionalRouter: Pick<Router, 'result_name'> = {};
    if (state.resultName.value) {
        optionalRouter.result_name = state.resultName.value;
    }

    // TODO: shouldnt have an operand
    const router: SwitchRouter = {
        type: RouterTypes.switch,
        default_exit_uuid: defaultExit,
        cases,
        operand: DEFAULT_OPERAND,
        ...optionalRouter
    };

    const wait = { type: WaitTypes.msg } as Wait;
    if (state.timeout > 0) {
        wait.timeout = state.timeout;
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
