import {
  hasCases,
  createCaseProps,
  resolveRoutes,
  ResolvedRoutes,
  createRenderNode
} from 'components/flow/routers/helpers';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { Types, Operators, VISIBILITY_HIDDEN } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { CallClassifier, SwitchRouter, Case, Exit, Category, RouterTypes } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry, FormEntry } from 'store/nodeEditor';
import { createUUID, scalarArrayEquals, snakify } from 'utils';
import { ClassifyRouterFormState } from 'components/flow/routers/classify/ClassifyRouterForm';
import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { getOperatorConfig } from 'config';

export const getOriginalAction = (settings: NodeEditorSettings): CallClassifier => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.call_classifier) {
    return action as CallClassifier;
  }
};

export const nodeToState = (settings: NodeEditorSettings): ClassifyRouterFormState => {
  // TODO: work out an incremental result name
  let resultName: StringEntry = { value: 'Result' };
  let initialCases: CaseProps[] = [];

  let operand = DEFAULT_OPERAND;
  let classifier: FormEntry = { value: null };

  let hiddenCases: CaseProps[] = [];

  if (getType(settings.originalNode) === Types.split_by_intent) {
    const router = settings.originalNode.node.router as SwitchRouter;

    if (hasCases(settings.originalNode.node)) {
      initialCases = createCaseProps(router.cases, settings.originalNode);

      hiddenCases = initialCases.filter(
        (kase: CaseProps) => getOperatorConfig(kase.kase.type).visibility === VISIBILITY_HIDDEN
      );

      initialCases = initialCases.filter(
        (kase: CaseProps) => getOperatorConfig(kase.kase.type).visibility !== VISIBILITY_HIDDEN
      );
    }

    resultName = { value: router.result_name || 'Result' };
    const action = getOriginalAction(settings) as CallClassifier;
    classifier = { value: action.classifier };
    operand = action.input;
  }

  const state: ClassifyRouterFormState = {
    hiddenCases,
    resultName,
    classifier,
    operand: { value: operand },
    cases: initialCases,
    valid: true
  };

  return state;
};

export interface Route {
  type: Operators;
  arguments: string[];
  name: 'Other';
}

export const ensureRoute = (routes: ResolvedRoutes, route: Route) => {
  const existingCasePosition = routes.cases.findIndex(
    kase => kase.type === route.type && scalarArrayEquals(kase.arguments, route.arguments)
  );

  // if it already exists, make sure it's at the end
  if (existingCasePosition >= 0) {
    // already in the right place we are done
    if (existingCasePosition === routes.cases.length - 1) {
      return;
    }

    const [existingCase] = routes.cases.splice(existingCasePosition, 1);
    routes.cases.push(existingCase);

    return;
  }

  const exit: Exit = {
    uuid: createUUID()
  };

  const category: Category = {
    uuid: createUUID(),
    name: route.name,
    exit_uuid: exit.uuid
  };

  // otherwise let's add it
  const kase: Case = {
    uuid: createUUID(),
    type: route.type,
    arguments: route.arguments,
    category_uuid: category.uuid
  };

  routes.categories.push(category);
  routes.cases.push(kase);

  // our new exit should go right in front of the default exit
  routes.exits.splice(routes.exits.length - 1, 0, exit);
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: ClassifyRouterFormState
): RenderNode => {
  let uuid = createUUID();

  const routes = resolveRoutes(
    [...state.cases, ...state.hiddenCases],
    false,
    settings.originalNode.node,
    'Failure'
  );

  // make sure we have an other route since failure is our default
  ensureRoute(routes, {
    type: Operators.has_category,
    arguments: ['Success', 'Skipped'],
    name: 'Other'
  });

  const originalAction = getOriginalAction(settings);
  if (originalAction) {
    uuid = originalAction.uuid;
  }

  const routerResultName = state.resultName.value;
  const actionResultName = '_' + routerResultName + ' Classification';

  const newAction: CallClassifier = {
    uuid,
    type: Types.call_classifier,
    result_name: actionResultName,
    input: state.operand.value,
    classifier: {
      uuid: state.classifier.value.uuid,
      name: state.classifier.value.name
    }
  };

  const router: SwitchRouter = {
    cases: routes.cases,
    operand: `@results.${snakify(actionResultName)}`,
    categories: routes.categories,
    type: RouterTypes.switch,
    default_category_uuid: routes.defaultCategory,
    result_name: routerResultName
  };

  return createRenderNode(
    settings.originalNode.node.uuid,
    router,
    routes.exits,
    Types.split_by_intent,
    [newAction]
  );
};
