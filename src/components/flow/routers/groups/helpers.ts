import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { GroupsRouterFormState } from 'components/flow/routers/groups/GroupsRouterForm';
import { createRenderNode, getSwitchRouter, resolveRoutes } from 'components/flow/routers/helpers';
import { GROUPS_OPERAND } from 'components/nodeeditor/constants';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { Category, FlowNode, RouterTypes, SwitchRouter } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';
import { createUUID } from 'utils';

export const nodeToState = (settings: NodeEditorSettings): GroupsRouterFormState => {
  const state: GroupsRouterFormState = {
    groups: { value: [] },
    resultName: { value: '' },
    valid: false
  };

  if (getType(settings.originalNode) === Types.split_by_groups) {
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
  const { cases, exits, defaultCategory: defaultExit, caseConfig, categories } = resolveRoutes(
    currentCases,
    false,
    settings.originalNode.node
  );

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    cases,
    categories,
    default_category_uuid: defaultExit,
    operand: GROUPS_OPERAND,
    result_name: state.resultName.value
  };

  return createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    Types.split_by_groups,
    [],
    { cases: caseConfig }
  );
};

export const extractGroups = (node: FlowNode): any[] => {
  let groups: any[] = [];
  const router = getSwitchRouter(node);
  if (router) {
    groups = (router as SwitchRouter).cases.map(kase => {
      const category = router.categories.find((cat: Category) => cat.uuid === kase.category_uuid);
      return {
        name: category.name,
        uuid: kase.arguments[0]
      };
    });
  }
  return groups;
};
export const groupsToCases = (groups: any[] = []): CaseProps[] => {
  return groups.map(({ name, uuid }: any) => ({
    uuid,
    kase: {
      uuid: createUUID(),
      type: Operators.has_group,
      arguments: [uuid, name],
      category_uuid: ''
    },
    categoryName: name,
    valid: true
  }));
};
