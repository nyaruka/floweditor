import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { Delay } from 'flowTypes';
import { NodeEditorSettings } from 'store/nodeEditor';
import { RouterTypes, SwitchRouter } from 'flowTypes';
import { createRenderNode, resolveRoutes } from '../helpers';
import { SequenceFormState } from './SequenceForm';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';

export const actionToState = (settings: NodeEditorSettings): SequenceFormState => {
  let delayNode: SequenceFormState = {
    valid: true,
    days: '0',
    hours: '0',
    minutes: '0'
  };

  // console.log(settings);
  if (settings.originalAction && settings.originalAction.type === 'wait_for_time') {
    const action = settings.originalAction as Delay;
    if (action.delay) {
      const delayInSeconds = parseInt(action.delay);
      delayNode.days = Math.floor(delayInSeconds / (3600 * 24)).toString();
      delayNode.hours = Math.floor((delayInSeconds % (3600 * 24)) / 3600).toString();
      delayNode.minutes = Math.floor((delayInSeconds % 3600) / 60).toString();
    }
  }

  return delayNode;
};

export const stateToNode = (settings: NodeEditorSettings, state: SequenceFormState): any => {
  const { days, hours, minutes } = state;

  const delayInSeconds = parseInt(days) * 86400 + parseInt(hours) * 3600 + parseInt(minutes) * 60;
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
    Types.wait_for_time,
    [
      {
        type: Types.wait_for_time,
        uuid: getActionUUID(settings, Types.send_msg),
        delay: delayInSeconds.toString()
      }
    ],
    { cases: caseConfig }
  );

  return newRenderNode;
};
