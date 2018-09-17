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
import { AssetType, RenderNode } from '~/store/flowContext';
import { NodeEditorSettings, StringEntry } from '~/store/nodeEditor';

import { ResultRouterFormState } from './ResultRouterForm';
import { SelectOption } from '~/components/form/select/SelectElement';

export const FIELD_NUMBER_OPTIONS: SelectOption[] = [
    { value: '1', label: 'first' },
    { value: '2', label: 'second' },
    { value: '3', label: 'third' },
    { value: '4', label: 'fourth' },
    { value: '5', label: 'fifth' },
    { value: '6', label: 'sixth' },
    { value: '7', label: 'seventh' },
    { value: '8', label: 'eighth' },
    { value: '9', label: 'ninth' }
];

export const getFieldOption = (value: number): SelectOption => {
    return FIELD_NUMBER_OPTIONS.find((option: SelectOption) => option.value === '' + value);
};

export const DELIMITER_OPTIONS: SelectOption[] = [
    { value: ' ', label: 'spaces' },
    { value: '.', label: 'periods' },
    { value: '+', label: 'plusses' }
];

export const getDelimiterOption = (value: string): SelectOption => {
    return DELIMITER_OPTIONS.find((option: SelectOption) => option.value === value);
};

export const nodeToState = (settings: NodeEditorSettings): ResultRouterFormState => {
    let initialCases: CaseProps[] = [];

    // TODO: work out an incremental result name
    let resultName: StringEntry = { value: '' };

    let result: any = null;
    let fieldNumber = 1;
    let delimiter = ' ';
    let shouldDelimit = false;

    if (
        (settings.originalNode && settings.originalNode.ui.type === Types.split_by_run_result) ||
        settings.originalNode.ui.type === Types.split_by_run_result_delimited
    ) {
        const router = settings.originalNode.node.router as SwitchRouter;

        if (router) {
            if (hasCases(settings.originalNode.node)) {
                initialCases = createCaseProps(router.cases, settings.originalNode.node.exits);
            }

            resultName = { value: router.result_name || '' };
        }

        const config = settings.originalNode.ui.config;
        if (config && config.operand) {
            result = { id: config.operand.id, type: config.operand.type };
        }

        if (settings.originalNode.ui.type === Types.split_by_run_result_delimited) {
            fieldNumber = config.index;
            delimiter = config.delimiter;
            shouldDelimit = true;
        }
    }

    return {
        cases: initialCases,
        resultName,
        result: { value: result },
        shouldDelimit,
        fieldNumber,
        delimiter,
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

    let nodeType = Types.split_by_run_result;
    let operand = DEFAULT_OPERAND;
    const asset = state.result.value;
    if (asset.type === AssetType.URN) {
        operand = `@(format_urn(contact.urns.${asset.id}))`;
    } else if (asset.type === AssetType.Field) {
        operand = `@contact.fields.${asset.id}`;
    } else {
        operand = `@contact.${asset.id}`;
    }

    const config: any = {
        operand: {
            id: asset.id,
            type: asset.type,
            name: asset.name
        }
    };

    if (state.shouldDelimit) {
        config.index = state.fieldNumber;
        config.delimiter = state.delimiter;
        nodeType = Types.split_by_run_result_delimited;
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
        nodeType,
        [],
        null,
        config
    );

    return newRenderNode;
};
