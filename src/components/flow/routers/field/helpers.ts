import { NAME_PROPERTY } from '~/components/flow/props';
import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import {
    FieldRouterFormState,
    getRoutableFields
} from '~/components/flow/routers/field/FieldRouterForm';
import {
    createCaseProps,
    createRenderNode,
    hasCases,
    resolveRoutes
} from '~/components/flow/routers/helpers';
import { DEFAULT_OPERAND } from '~/components/nodeeditor/constants';
import { Types } from '~/config/interfaces';
import { Router, RouterTypes, SwitchRouter } from '~/flowTypes';
import { Asset, AssetStore, AssetType, RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

export const nodeToState = (
    settings: NodeEditorSettings,
    assetStore: AssetStore
): FieldRouterFormState => {
    let initialCases: CaseProps[] = [];

    // TODO: work out an incremental result name
    let resultName: StringEntry = { value: '' };

    let field: any = null;

    if (settings.originalNode && settings.originalNode.ui.type === Types.split_by_contact_field) {
        const router = settings.originalNode.node.router as SwitchRouter;

        if (router) {
            if (hasCases(settings.originalNode.node)) {
                initialCases = createCaseProps(router.cases, settings.originalNode);
            }

            resultName = { value: router.result_name || '' };
        }

        const operand = settings.originalNode.ui.config.operand;

        if (assetStore.fields) {
            if (operand.id in assetStore.fields.items) {
                const name = assetStore.fields.items[operand.id].name;
                field = { id: operand.id, type: operand.type, name };
            }
        }

        // couldn't find the asset, checkour routable fields
        if (!field) {
            field = getRoutableFields().find((asset: Asset) => asset.id === operand.id);
        }
    }

    // our default is name
    if (!field) {
        field = NAME_PROPERTY;
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
