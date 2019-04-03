import { NAME_PROPERTY } from '~/components/flow/props';
import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { FieldRouterFormState } from '~/components/flow/routers/field/FieldRouterForm';
import {
    createCaseProps,
    createRenderNode,
    hasCases,
    resolveRoutes
} from '~/components/flow/routers/helpers';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Types } from '~/config/interfaces';
import { Router, RouterTypes, SwitchRouter } from '~/flowTypes';
import { AssetStore, AssetType, RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

export const nodeToState = (
    settings: NodeEditorSettings,
    assetStore: AssetStore
): FieldRouterFormState => {
    let initialCases: CaseProps[] = [];

    // TODO: work out an incremental result name
    let resultName: StringEntry = { value: '' };

    let field: any = NAME_PROPERTY;

    if (settings.originalNode && settings.originalNode.ui.type === Types.split_by_contact_field) {
        const router = settings.originalNode.node.router as SwitchRouter;

        if (router) {
            if (hasCases(settings.originalNode.node)) {
                initialCases = createCaseProps(router.cases, settings.originalNode);
            }

            resultName = { value: router.result_name || '' };
        }

        const operand = settings.originalNode.ui.config.operand;
        const name = assetStore.fields ? assetStore.fields.items[operand.id].name : null;
        field = { id: operand.id, type: operand.type, name };
    }

    return {
        cases: initialCases,
        resultName,
        field: { value: field },
        valid: true
    };
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: FieldRouterFormState
): RenderNode => {
    const { cases, exits, defaultCategory: defaultExit, caseConfig, categories } = resolveRoutes(
        state.cases,
        false,
        settings.originalNode.node
    );

    const optionalRouter: Pick<Router, 'result_name'> = {};
    if (state.resultName.value) {
        optionalRouter.result_name = state.resultName.value;
    }

    let operand = DEFAULT_OPERAND;
    const asset = state.field.value;
    if (asset.type === AssetType.URN) {
        operand = `@(format_urn(contact.urns.${asset.id}))`;
    } else if (asset.type === AssetType.Field) {
        operand = `@contact.fields.${asset.id}`;
    } else {
        operand = `@contact.${asset.id}`;
    }

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        default_category_uuid: defaultExit,
        cases,
        categories,
        operand,
        ...optionalRouter
    };

    const newRenderNode = createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.split_by_contact_field,
        [],
        {
            operand: {
                id: asset.id,
                type: asset.type,
                name: asset.name
            },
            cases: caseConfig
        }
    );

    return newRenderNode;
};
