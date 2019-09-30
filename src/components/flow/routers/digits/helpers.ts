import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import {
  createCaseProps,
  createRenderNode,
  hasCases,
  resolveRoutes
} from 'components/flow/routers/helpers';
import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { HintTypes, Router, RouterTypes, SwitchRouter, WaitTypes } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';

import { DigitsRouterFormState } from './DigitsRouterForm';
import { DIGITS_OPERAND } from 'components/nodeeditor/constants';

export const nodeToState = (settings: NodeEditorSettings): DigitsRouterFormState => {
  let initialCases: CaseProps[] = [];

  // TODO: work out an incremental result name
  let resultName: StringEntry = { value: '' };

  if (getType(settings.originalNode) === Types.wait_for_digits) {
    const router = settings.originalNode.node.router as SwitchRouter;
    if (router) {
      if (hasCases(settings.originalNode.node)) {
        initialCases = createCaseProps(router.cases, settings.originalNode);
      }

      resultName = { value: router.result_name || '' };
    }
  }

  return {
    cases: initialCases,
    resultName,
    valid: true
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: DigitsRouterFormState
): RenderNode => {
  const { cases, exits, categories, defaultCategory: defaultExit, caseConfig } = resolveRoutes(
    state.cases,
    false,
    settings.originalNode.node
  );

  const optionalRouter: Pick<Router, 'result_name'> = {};
  if (state.resultName.value) {
    optionalRouter.result_name = state.resultName.value;
  }

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    default_category_uuid: defaultExit,
    categories,
    cases,
    operand: DIGITS_OPERAND,
    wait: { type: WaitTypes.msg, hint: { type: HintTypes.digits } },
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
