import { DialRouterFormState } from 'components/flow/routers/dial/DialRouterForm';
import { createRenderNode, getSwitchRouter } from 'components/flow/routers/helpers';
import { DIAL_OPERAND } from 'components/nodeeditor/constants';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import {
  Case,
  Category,
  DialCategoryNames,
  DialStatus,
  Exit,
  Router,
  RouterTypes,
  SwitchRouter,
  Wait,
  WaitTypes
} from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { createUUID } from 'utils';

export const nodeToState = (settings: NodeEditorSettings): DialRouterFormState => {
  let phone = '';
  let resultName: StringEntry = { value: '' };

  if (settings.originalNode && getType(settings.originalNode) === Types.wait_for_dial) {
    const router = settings.originalNode.node.router as SwitchRouter;
    if (router) {
      phone = router.wait.phone;
      resultName = { value: router.result_name || '' };
    }
  }

  return {
    phone: { value: phone },
    resultName,
    valid: true
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: DialRouterFormState
): RenderNode => {
  let categories: Category[] = [];
  let cases: Case[] = [];
  let exits: Exit[] = [];

  const previousRouter = settings.originalNode ? getSwitchRouter(settings.originalNode.node) : null;

  // see if we are editing an existing dial router so we reuse exits
  if (previousRouter && previousRouter.wait && previousRouter.wait.type === WaitTypes.dial) {
    previousRouter.cases.forEach(kase => cases.push(kase));
    previousRouter.categories.forEach(category => categories.push(category));
    settings.originalNode.node.exits.forEach((exit: any) => exits.push(exit));
  } else {
    // otherwise, let's create some new ones
    exits = [
      {
        uuid: createUUID(),
        destination_uuid: null
      },
      {
        uuid: createUUID(),
        destination_uuid: null
      },
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
        name: DialCategoryNames.Answered,
        exit_uuid: exits[0].uuid
      },
      {
        uuid: createUUID(),
        name: DialCategoryNames.NoAnswer,
        exit_uuid: exits[1].uuid
      },
      {
        uuid: createUUID(),
        name: DialCategoryNames.Busy,
        exit_uuid: exits[2].uuid
      },
      {
        uuid: createUUID(),
        name: DialCategoryNames.Failure,
        exit_uuid: exits[3].uuid
      }
    ];

    cases = [
      {
        uuid: createUUID(),
        type: Operators.has_only_text,
        arguments: [DialStatus.answered],
        category_uuid: categories[0].uuid
      },
      {
        uuid: createUUID(),
        type: Operators.has_only_text,
        arguments: [DialStatus.noAnswer],
        category_uuid: categories[1].uuid
      },
      {
        uuid: createUUID(),
        type: Operators.has_only_text,
        arguments: [DialStatus.busy],
        category_uuid: categories[2].uuid
      }
    ];
  }

  const optionalRouter: Pick<Router, 'result_name'> = {};
  if (state.resultName.value) {
    optionalRouter.result_name = state.resultName.value;
  }

  const wait = { type: WaitTypes.dial, phone: state.phone.value } as Wait;

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    wait: wait,
    default_category_uuid: categories[categories.length - 1].uuid,
    categories,
    cases,
    operand: DIAL_OPERAND,
    ...optionalRouter
  };

  const newRenderNode = createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    Types.wait_for_dial,
    []
  );

  return newRenderNode;
};
