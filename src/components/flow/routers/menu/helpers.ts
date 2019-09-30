import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { createRenderNode, resolveRoutes } from 'components/flow/routers/helpers';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { Case, Category, HintTypes, Router, RouterTypes, SwitchRouter, WaitTypes } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';

import { MenuRouterFormState } from './MenuRouterForm';
import { MENU_OPERAND } from 'components/nodeeditor/constants';

export const nodeToState = (settings: NodeEditorSettings): MenuRouterFormState => {
  let resultName: StringEntry = { value: '' };

  const menu: string[] = [];
  for (let i = 0; i < 10; i++) {
    menu.push('');
  }

  if (getType(settings.originalNode) === Types.wait_for_menu) {
    const router = settings.originalNode.node.router as SwitchRouter;
    for (const kase of router.cases) {
      let idx = parseInt(kase.arguments[0], 10) - 1;
      if (idx === -1) {
        idx = menu.length - 1;
      }

      menu[idx] = settings.originalNode.node.router.categories.find(
        (category: Category) => category.uuid === kase.category_uuid
      ).name;
    }
    resultName = { value: router.result_name || '' };
  }

  return {
    resultName,
    menu,
    valid: true
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: MenuRouterFormState
): RenderNode => {
  const optionalRouter: Pick<Router, 'result_name'> = {};
  if (state.resultName.value) {
    optionalRouter.result_name = state.resultName.value;
  }

  let originalCases: Case[] = [];
  if (getType(settings.originalNode) === Types.wait_for_menu) {
    originalCases = (settings.originalNode.node.router as SwitchRouter).cases;
  }

  const caseProps = menuToCases(state.menu, originalCases);
  const { cases, exits, defaultCategory: defaultExit, caseConfig, categories } = resolveRoutes(
    caseProps,
    false,
    settings.originalNode.node
  );

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    operand: MENU_OPERAND,
    default_category_uuid: defaultExit,
    cases,
    categories,
    wait: { type: WaitTypes.msg, hint: { type: HintTypes.digits, count: 1 } },
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

export const menuToCases = (menu: string[] = [], previousCases: Case[]): CaseProps[] =>
  menu
    .map((categoryName: string, index: number) => {
      const idx = index === 9 ? 0 : index + 1;

      const kase =
        previousCases.find((c: Case) => c.arguments[0] === '' + idx) ||
        ({
          uuid: createUUID(),
          arguments: ['' + idx],
          type: Operators.has_number_eq,
          category_uuid: ''
        } as Case);

      return {
        uuid: kase.uuid,
        kase,
        categoryName,
        valid: true
      };
    })
    .filter((caseProps: CaseProps) => caseProps.categoryName.trim().length > 0);
