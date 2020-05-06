import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { DefaultExitNames } from 'components/flow/routers/constants';
import { Operators, Types } from 'config/interfaces';
import {
  Action,
  CallResthook,
  CallWebhook,
  Case,
  Category,
  Exit,
  FlowNode,
  Router,
  RouterTypes,
  SwitchRouter,
  TransferAirtime,
  UIConfig,
  WebhookExitNames,
  CallClassifier,
  OpenTicket
} from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { createUUID, snakify } from 'utils';

export interface CategorizedCases {
  cases: Case[];
  categories: Category[];
  exits: Exit[];
  caseConfig: { [uuid: string]: any };
}
export interface ResolvedRoutes extends CategorizedCases {
  defaultCategory: string;
  timeoutCategory?: string;
}

export const createRenderNode = (
  uuid: string,
  router: Router,
  exits: Exit[],
  type: Types,
  actions: Action[] = [],
  uiConfig: { [key: string]: any } = {}
): RenderNode => {
  const renderNode: RenderNode = {
    node: {
      uuid,
      actions,
      router,
      exits
    },
    ui: {
      type,
      position: null,
      config: uiConfig
    },
    inboundConnections: {}
  };
  return renderNode;
};

export const hasCases = (node: FlowNode): boolean => {
  if (
    node.router &&
    (node.router as SwitchRouter).cases &&
    (node.router as SwitchRouter).cases.length
  ) {
    return true;
  }
  return false;
};

export const getCategories = (renderNode: RenderNode): Category[] => {
  if (renderNode.node.router) {
    return renderNode.node.router.categories;
  }
  return [];
};

export const createCaseProps = (cases: Case[], renderNode: RenderNode): CaseProps[] => {
  const categories: Category[] = getCategories(renderNode);

  // make sure we don't mutate the in memory version of our cases
  const newCases = JSON.parse(JSON.stringify(cases));
  return newCases.map((kase: Case) => {
    const matchingCategory = categories.find(
      (category: Category) => category.uuid === kase.category_uuid
    );

    if (isRelativeDate(kase.type)) {
      if (renderNode.ui.config && renderNode.ui.config.cases) {
        const caseConfig = renderNode.ui.config.cases[kase.uuid];
        if (caseConfig && caseConfig.arguments) {
          kase.arguments = caseConfig.arguments;
        }
      }
    }

    return {
      uuid: kase.uuid,
      kase,
      categoryName: matchingCategory ? matchingCategory.name : null,
      valid: true
    };
  });
};

export const isRelativeDate = (operatorType: Operators): boolean => {
  return !![Operators.has_date_eq, Operators.has_date_gt, Operators.has_date_lt].find(
    (type: string) => operatorType === type
  );
};

const isCategoryMatch = (cat: Category, kase: CaseProps) => {
  // see if we have the same name
  return cat.name.toLowerCase().trim() === kase.categoryName.trim().toLowerCase();
};

/**
 * Given a set of cases and previous categories, determines correct merging of cases
 * and the union of categories
 */
export const categorizeCases = (
  newCases: CaseProps[],
  originalNode: FlowNode
): CategorizedCases => {
  const categories: Category[] = [];
  const cases: Case[] = [];
  const exits: Exit[] = [];
  const caseConfig: UIConfig = {};

  const originalRouter = originalNode && originalNode.router;
  const previousCategories = (originalRouter && originalRouter.categories) || [];

  // look over the new cases and match up categories and exits
  for (const newCase of newCases) {
    // ignore empty cases
    if (!newCase.categoryName || newCase.categoryName.trim().length === 0) {
      continue;
    }

    // convert relative dates to expressions with configs
    if (isRelativeDate(newCase.kase.type)) {
      caseConfig[newCase.uuid] = { arguments: newCase.kase.arguments };
      newCase.kase.arguments = [`@(datetime_add(today(), ${newCase.kase.arguments[0]}, "D"))`];
    }

    //  see if it exists on a previous case
    let category = categories.find((cat: Category) => isCategoryMatch(cat, newCase));

    // if not, see if that category exists on our old node
    if (!category) {
      category = previousCategories.find((cat: Category) => isCategoryMatch(cat, newCase));

      // still no category, lets see if we can find a case uuid match
      if (!category) {
        const router = getSwitchRouter(originalNode);
        if (router) {
          const previousCase = router.cases.find((kase: Case) => kase.uuid === newCase.uuid);
          if (previousCase) {
            const previousCategory = previousCategories.find(
              (cat: Category) => cat.uuid === previousCase.category_uuid
            );

            if (previousCategory) {
              category = { ...previousCategory, name: newCase.categoryName };
            }
          }
        }
      }

      // don't pull over an old category more than once
      if (category && categories.find((cat: Category) => cat.uuid === category.uuid)) {
        category = null;
      }

      // we found an old category, bring it and its exit over
      if (category) {
        categories.push(category);
        const previousExit = originalNode.exits.find(
          (exit: Exit) => category.exit_uuid === exit.uuid
        );
        exits.push(previousExit);
      }
    }

    // if still no category, finally lets just create a new one
    if (!category) {
      const exit: Exit = {
        uuid: createUUID()
      };

      exits.push(exit);

      category = {
        uuid: createUUID(),
        name: newCase.categoryName,
        exit_uuid: exit.uuid
      };

      categories.push(category);
    }

    // lastly, add our case
    cases.push({
      ...newCase.kase,
      category_uuid: category.uuid
    });
  }

  return { cases, categories, exits, caseConfig };
};

export const getSwitchRouter = (node: FlowNode): SwitchRouter => {
  if (node && node.router && node.router.type === RouterTypes.switch) {
    return node.router as SwitchRouter;
  }
  return null;
};

/**
 * Adds a default route, reusing the previous one if possible
 * @param originalNode
 */
export const getDefaultRoute = (
  defaultCategoryName: string,
  originalNode: FlowNode
): { defaultCategory: Category; defaultExit: Exit } => {
  const originalRouter = getSwitchRouter(originalNode);

  // use the previous default if it had one
  if (originalRouter) {
    const defaultCategory = originalRouter.categories.find(
      (cat: Category) => cat.uuid === originalRouter.default_category_uuid
    );

    const defaultExit = originalNode.exits.find((e: Exit) => e.uuid === defaultCategory.exit_uuid);

    defaultCategory.name = defaultCategoryName;

    return { defaultCategory, defaultExit };
  }
  // otherwise, create a new exit and category
  else {
    const defaultExit: Exit = {
      uuid: createUUID()
    };

    const defaultCategory = {
      uuid: createUUID(),
      name: defaultCategoryName,
      exit_uuid: defaultExit.uuid
    };

    return { defaultCategory, defaultExit };
  }
};

const getTimeoutRoute = (
  originalNode: FlowNode
): { timeoutCategory: Category; timeoutExit: Exit } => {
  let timeoutCategory: Category = null;
  let timeoutExit: Exit = null;

  const originalRouter = getSwitchRouter(originalNode);

  // see if our previous node had a timeout case
  if (originalRouter) {
    if (originalRouter.wait && originalRouter.wait.timeout) {
      const previousCategory = originalRouter.wait.timeout.category_uuid;
      timeoutCategory = originalRouter.categories.find(
        (cat: Category) => cat.uuid === previousCategory
      );
      timeoutExit = originalNode.exits.find(
        (exit: Exit) => exit.uuid === timeoutCategory.exit_uuid
      );
    }
  }

  if (!timeoutCategory) {
    // create a new route
    timeoutExit = {
      uuid: createUUID()
    };

    timeoutCategory = {
      uuid: createUUID(),
      name: DefaultExitNames.No_Response,
      exit_uuid: timeoutExit.uuid
    };
  }

  return { timeoutCategory, timeoutExit };
};

/**
 * Given a set of cases and previous categories, determines correct merging of cases
 * and the union of categories
 */
export const resolveRoutes = (
  newCases: CaseProps[],
  hasTimeout: boolean,
  originalNode: FlowNode,
  defaultCategoryName: string = null
): ResolvedRoutes => {
  const resolved = categorizeCases(newCases, originalNode);

  let resolvedDefaultCategory = defaultCategoryName;
  if (!resolvedDefaultCategory) {
    resolvedDefaultCategory =
      resolved.categories.length > 0 ? DefaultExitNames.Other : DefaultExitNames.All_Responses;
  }

  // tack on our other category
  const { defaultCategory, defaultExit } = getDefaultRoute(resolvedDefaultCategory, originalNode);
  resolved.categories.push(defaultCategory);
  resolved.exits.push(defaultExit);

  const results: ResolvedRoutes = {
    ...resolved,
    defaultCategory: defaultCategory.uuid
  };

  // add in a timeout route if we need one
  if (hasTimeout) {
    const { timeoutCategory, timeoutExit } = getTimeoutRoute(originalNode);
    resolved.categories.push(timeoutCategory);
    resolved.exits.push(timeoutExit);
    results.timeoutCategory = timeoutCategory.uuid;
  }

  return results;
};

export const createWebhookBasedNode = (
  action: CallWebhook | CallResthook | OpenTicket | TransferAirtime,
  originalNode: RenderNode,
  useCategoryTest: boolean
): RenderNode => {
  const exits: Exit[] = [];
  let cases: Case[] = [];
  let categories: Category[] = [];

  // see if we are editing an existing router so we reuse exits
  if (
    originalNode &&
    originalNode.node.actions.length === 1 &&
    originalNode.node.actions[0].type === action.type
  ) {
    const previousRouter = getSwitchRouter(originalNode.node);
    originalNode.node.exits.forEach((exit: any) => exits.push(exit));
    previousRouter.cases.forEach(kase => cases.push(kase));
    originalNode.node.router.categories.forEach(category => categories.push(category));
  } else {
    // Otherwise, let's create some new ones
    exits.push(
      {
        uuid: createUUID(),
        destination_uuid: null
      },
      {
        uuid: createUUID(),
        destination_uuid: null
      }
    );

    categories = [
      {
        uuid: createUUID(),
        name: WebhookExitNames.Success,
        exit_uuid: exits[0].uuid
      },
      {
        uuid: createUUID(),
        name: WebhookExitNames.Failure,
        exit_uuid: exits[1].uuid
      }
    ];

    cases = [
      {
        uuid: createUUID(),
        type: useCategoryTest ? Operators.has_category : Operators.has_only_text,
        arguments: [WebhookExitNames.Success],
        category_uuid: categories[0].uuid
      }
    ];
  }

  let operand = '@results.' + snakify(action.result_name);
  if (!useCategoryTest) {
    operand += '.category';
  }

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    operand: operand,
    cases,
    categories,
    default_category_uuid: categories[categories.length - 1].uuid
  };

  let splitType = Types.split_by_webhook;
  if (action.type === Types.call_resthook) {
    splitType = Types.split_by_resthook;
  } else if (action.type === Types.open_ticket) {
    splitType = Types.split_by_ticket;
  } else if (action.type === Types.transfer_airtime) {
    splitType = Types.split_by_airtime;
  }

  return createRenderNode(originalNode.node.uuid, router, exits, splitType, [action]);
};

export const createSplitOnActionResultNode = (
  action: CallClassifier,
  originalNode: RenderNode
): RenderNode => {
  const splitType = Types.split_by_intent;
  const exits: Exit[] = [];
  const router: SwitchRouter = {
    cases: [],
    operand: '',
    categories: [],
    type: RouterTypes.switch,
    default_category_uuid: null
  };

  return createRenderNode(originalNode.node.uuid, router, exits, splitType, [action]);
};
