import { getActionUUID } from 'components/flow/actions/helpers';
import { createRenderNode, resolveRoutes } from 'components/flow/routers/helpers';
import {} from 'components/flow/routers/wait/WaitRouterForm';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { Types } from 'config/interfaces';
import { Delay, RouterTypes, SwitchRouter } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';
import { WebhookResultRouterFormState } from './WebhookResultRouterForm';

export const nodeToState = (settings: NodeEditorSettings): WebhookResultRouterFormState => {
  let delayNode: WebhookResultRouterFormState = {
    valid: true,
    days: { value: '0' },
    hours: { value: '0' },
    minutes: { value: '1' }
  };

  if (settings.originalAction && settings.originalAction.type === Types.wait_for_result) {
    const action = settings.originalAction as Delay;

    if (action.delay) {
      const delayInSeconds = parseInt(action.delay);
      delayNode.days.value = Math.floor(delayInSeconds / (3600 * 24)).toString();
      delayNode.hours.value = Math.floor((delayInSeconds % (3600 * 24)) / 3600).toString();
      delayNode.minutes.value = Math.floor((delayInSeconds % 3600) / 60).toString();
    }
  }

  return delayNode;
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: WebhookResultRouterFormState
): RenderNode => {
  const { days, hours, minutes } = state;

  const delayInSeconds =
    parseInt(days.value) * 86400 + parseInt(hours.value) * 3600 + parseInt(minutes.value) * 60;
  const { cases, exits, defaultCategory, caseConfig, categories } = resolveRoutes(
    [],
    false,
    settings.originalNode.node,
    'Completed'
  );

  const router: SwitchRouter = {
    type: RouterTypes.switch,
    default_category_uuid: defaultCategory,
    cases,
    categories,
    operand: DEFAULT_OPERAND
  };

  const newRenderNode = createRenderNode(
    settings.originalNode.node.uuid,
    router,
    exits,
    Types.wait_for_result,
    [
      {
        type: Types.wait_for_result,
        uuid: getActionUUID(settings, Types.wait_for_result),
        delay: delayInSeconds.toString()
      }
    ],
    { cases: caseConfig }
  );

  return newRenderNode;
};
