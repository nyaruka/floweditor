import { CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { GroupsRouterFormState } from '~/components/flow/routers/groups/GroupsRouterForm';
import { createRenderNode, resolveExits } from '~/components/flow/routers/helpers';
import { GROUPS_OPERAND } from '~/components/nodeeditor/constants';
import { Operators } from '~/config/operatorConfigs';
import { Types } from '~/config/typeConfigs';
import { FlowNode, RouterTypes, SwitchRouter, WaitTypes } from '~/flowTypes';
import { Asset, AssetType, RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';

export const nodeToState = (settings: NodeEditorSettings): GroupsRouterFormState => {
    const state: GroupsRouterFormState = {
        groups: { value: [] },
        resultName: { value: '' },
        valid: false
    };

    if (settings.originalNode.ui.type === Types.split_by_groups) {
        state.groups.value = extractGroups(settings.originalNode.node);
        state.resultName = {
            value: (settings.originalNode.node.router as SwitchRouter).result_name || ''
        };
        state.valid = true;
    }

    return state;
};

export const stateToNode = (
    settings: NodeEditorSettings,
    state: GroupsRouterFormState
): RenderNode => {
    const currentCases = groupsToCases(state.groups.value);
    const { cases, exits, defaultExit } = resolveExits(currentCases, false, settings);

    const router: SwitchRouter = {
        type: RouterTypes.switch,
        cases,
        default_exit_uuid: defaultExit,
        operand: GROUPS_OPERAND,
        result_name: state.resultName.value
    };

    return createRenderNode(
        settings.originalNode.node.uuid,
        router,
        exits,
        Types.split_by_groups,
        [],
        { type: WaitTypes.group }
    );
};

export const extractGroups = ({ exits, router }: FlowNode): Asset[] =>
    (router as SwitchRouter).cases.map(kase => {
        let resultName = '';
        for (const { name, uuid } of exits) {
            if (uuid === kase.exit_uuid) {
                resultName += name;
                break;
            }
        }
        return { name: resultName, id: kase.arguments[0], type: AssetType.Group };
    });

export const groupsToCases = (groups: Asset[] = []): CaseProps[] =>
    groups.map(({ name, id }: Asset) => ({
        uuid: id,
        kase: {
            uuid: id,
            type: Operators.has_group,
            arguments: [id],
            exit_uuid: ''
        },
        exitName: name
    }));
