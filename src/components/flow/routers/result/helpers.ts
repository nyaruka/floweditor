import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import {
    createCaseProps,
    createRenderNode,
    hasCases,
    resolveExits
} from '~/components/flow/routers/helpers';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Types } from '~/config/typeConfigs';
import { Router, RouterTypes, SwitchRouter } from '~/flowTypes';
import { AssetType } from '~/services/AssetService';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

import { ResultRouterFormState } from './ResultRouterForm';

export const nodeToState = (settings: NodeEditorSettings): ResultRouterFormState => {
    let initialCases: CaseProps[] = [];

    // TODO: work out an incremental result name
    let resultName: StringEntry = { value: '' };

    let result: any = null;

    if (settings.originalNode && settings.originalNode.ui.type === Types.split_by_run_result) {
        const router = settings.originalNode.node.router as SwitchRouter;

        if (router) {
            if (hasCases(settings.originalNode.node)) {
                initialCases = createCaseProps(router.cases, settings.originalNode.node.exits);
            }

            resultName = { value: router.result_name || '' };
        }

        const config = settings.originalNode.ui.config;
        if (config) {
            result = { id: config.id, type: config.type, name: config.name };
        }
    }

    return {
        cases: initialCases,
        resultName,
        result: { value: result },
        valid: true
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: ResultRouterFormState
): RenderNode => {
    const { cases, exits, defaultExit } = resolveExits(state.cases, false, settings);

    const optionalRouter: Pick<Router, 'result_name'> = {};
    if (state.resultName.value) {
        optionalRouter.result_name = state.resultName.value;
    }

    let operand = DEFAULT_OPERAND;
    const asset = state.result.value;
    if (asset.type === AssetType.URN) {
        operand = `@(format_urn(contact.urns.${asset.id}))`;
    } else if (asset.type === AssetType.Field) {
        operand = `@contact.fields.${asset.id}`;
    } else {
        operand = `@contact.${asset.id}`;
    }

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        default_exit_uuid: defaultExit,
        cases,
        operand,
        ...optionalRouter
    };

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.split_by_run_result,
        [],
        null,
        {
            id: asset.id,
            type: asset.type,
            name: asset.name
        }
    );

    return newRenderNode;
};
