import { createRenderNode } from 'components/flow/routers/helpers';
import { SubflowRouterFormState } from 'components/flow/routers/subflow/SubflowRouterForm';
import { SUBFLOW_OPERAND } from 'components/nodeeditor/constants';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import {
  Case,
  Category,
  Exit,
  Flow,
  RouterTypes,
  StartFlow,
  StartFlowExitNames,
  SwitchRouter
} from 'flowTypes';
import { Asset, AssetType, RenderNode } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';
import { createUUID } from 'utils';

export const nodeToState = (settings: NodeEditorSettings): SubflowRouterFormState => {
  if (
    getType(settings.originalNode) === Types.split_by_subflow ||
    (settings.originalAction && settings.originalAction.type === Types.enter_flow)
  ) {
    const action = (settings.originalAction ||
      (settings.originalNode.node.actions.length > 0 &&
        settings.originalNode.node.actions[0])) as StartFlow;

    return { flow: { value: flowToAsset(action.flow) }, valid: true };
  }

  return {
    flow: { value: null },
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

  const newAction: StartFlow = {
    uuid: action.uuid || createUUID(),
    type: Types.enter_flow,
    flow: assetToFlow(state.flow.value)
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
    [newAction]
  );

  return newRenderNode;
};

const flowToAsset = (field: Flow = { uuid: '', name: '' }): Asset => ({
  id: field.uuid,
  name: field.name,
  type: AssetType.Flow
});

const assetToFlow = (asset: Asset): Flow => ({
  uuid: asset.id,
  name: asset.name
});
