import { createRenderNode, resolveRoutes } from 'components/flow/routers/helpers';
import { WaitRouterFormState } from 'components/flow/routers/wait/WaitRouterForm';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { Type, Types } from 'config/interfaces';
import { HintTypes, Router, RouterTypes, SwitchRouter, Wait, WaitTypes } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';

export const nodeToState = (settings: NodeEditorSettings): WaitRouterFormState => {
  let resultName: StringEntry = { value: 'Result' };

  // look at the actual ui type instead of the hint here, we want results for any kind of wait
  if (settings.originalNode && settings.originalNode.ui.type === Types.wait_for_response) {
    const router = settings.originalNode.node.router as SwitchRouter;
    if (router) {
      resultName = { value: router.result_name || '' };
    }
  }

  return {
    resultName,
    valid: true
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: WaitRouterFormState,
  typeConfig: Type
): RenderNode => {
  const { exits, defaultCategory: defaultExit, caseConfig, categories } = resolveRoutes(
    [],
    false,
    settings.originalNode.node
  );

  const optionalRouter: Pick<Router, 'result_name'> = {};
  if (state.resultName.value) {
    optionalRouter.result_name = state.resultName.value;
  }

  const wait = { type: WaitTypes.msg } as Wait;
  switch (typeConfig.type) {
    case Types.wait_for_audio:
      wait.hint = { type: HintTypes.audio };
      break;
    case Types.wait_for_image:
      wait.hint = { type: HintTypes.image };
      break;
    case Types.wait_for_location:
      wait.hint = { type: HintTypes.location };
      break;
    case Types.wait_for_video:
      wait.hint = { type: HintTypes.video };
      break;
  }

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    default_category_uuid: defaultExit,
    cases: [],
    categories,
    wait,
    operand: DEFAULT_OPERAND,
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
