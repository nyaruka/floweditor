import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import {
    createCaseProps,
    createRenderNode,
    hasCases,
    resolveRoutes
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
                initialCases = createCaseProps(router.cases, settings.originalNode);
            }

            resultName = { value: router.result_name || '' };
        }

        if (settings.originalNode.node.router.wait) {
            timeout = settings.originalNode.node.router.wait.timeout || 0;
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
    const { cases, exits, defaultCategory: defaultExit, caseConfig, categories } = resolveRoutes(
        state.cases,
        state.timeout > 0,
        settings.originalNode.node
    );

    const optionalRouter: Pick<Router, 'result_name'> = {};
    if (state.resultName.value) {
        optionalRouter.result_name = state.resultName.value;
    }

    const wait = { type: WaitTypes.msg } as Wait;
    if (state.timeout > 0) {
        wait.timeout = state.timeout;
    }

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        default_category_uuid: defaultExit,
        cases,
        categories,
        operand: DEFAULT_OPERAND,
        wait,
        ...optionalRouter
    };

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.wait_for_response,
        [],
        { cases: caseConfig }
    );

    return newRenderNode;
};
