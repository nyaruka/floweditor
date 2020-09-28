import { createRenderNode } from 'components/flow/routers/helpers';
import { SubflowRouterFormState } from 'components/flow/routers/subflow/SubflowRouterForm';
import { SUBFLOW_OPERAND } from 'components/nodeeditor/constants';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import {
  Case,
  Category,
  Exit,
  RouterTypes,
  StartFlow,
  StartFlowExitNames,
  SwitchRouter,
  SetRunResult,
  AnyAction,
  Action
} from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';

export const nodeToState = (settings: NodeEditorSettings): SubflowRouterFormState => {
  const params: { [key: string]: StringEntry } = {};
  if (
    getType(settings.originalNode) === Types.split_by_subflow ||
    (settings.originalAction && settings.originalAction.type === Types.enter_flow)
  ) {
    let action = settings.originalAction as StartFlow;
    if (!action || action.type !== Types.enter_flow) {
      action = settings.originalNode.node.actions.find(
        (action: Action) => action.type === Types.enter_flow
      ) as StartFlow;
    }

    // look for any run result actions
    settings.originalNode.node.actions.forEach((action: AnyAction) => {
      if (action.type === Types.set_run_result) {
        const setRunResult = action as SetRunResult;
        params[setRunResult.name] = { value: setRunResult.value };
      }
    });

    return { flow: { value: action.flow }, params, valid: true };
  }

  return {
    flow: { value: null },
    params: {},
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

  const startFlowAction: StartFlow = {
    uuid: action.uuid || createUUID(),
    type: Types.enter_flow,
    flow: { uuid: state.flow.value.uuid, name: state.flow.value.name }
  };

  // If we're already a subflow, lean on those exits and cases
  let exits: Exit[];
  let cases: Case[];
  let categories: Category[];

  if (getType(settings.originalNode) === Types.split_by_subflow) {
    ({ exits } = settings.originalNode.node);
    ({ cases, categories } = settings.originalNode.node.router as SwitchRouter);
  } else {
    // Otherwise, let's create some new ones
    exits = [
      {
        uuid: createUUID(),
        destination_uuid: null
      },
      {
        uuid: createUUID(),
        destination_uuid: null
      }
    ];

    categories = [
      {
        uuid: createUUID(),
        name: StartFlowExitNames.Complete,
        exit_uuid: exits[0].uuid
      },
      {
        uuid: createUUID(),
        name: StartFlowExitNames.Expired,
        exit_uuid: exits[1].uuid
      }
    ];

    cases = [
      {
        uuid: createUUID(),
        type: Operators.has_only_text,
        arguments: ['completed'],
        category_uuid: categories[0].uuid
      },
      {
        uuid: createUUID(),
        arguments: ['expired'],
        type: Operators.has_only_text,
        category_uuid: categories[1].uuid
      }
    ];
  }

  const actions = [];

  // add some set result actions if needed
  Object.keys(state.params).forEach((key: string) => {
    const value = state.params[key] ? state.params[key].value || '' : '';
    if (value.trim().length > 0) {
      const setResultAction: SetRunResult = {
        uuid: createUUID(),
        name: key,
        value,
        type: Types.set_run_result
      };
      actions.push(setResultAction);
    }
  });

  actions.push(startFlowAction);

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    operand: SUBFLOW_OPERAND,
    cases,
    categories,
    default_category_uuid: categories[categories.length - 1].uuid
  };

  const newRenderNode = createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    Types.split_by_subflow,
    actions
  );

  return newRenderNode;
};
