import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { Delay } from 'flowTypes';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { SequenceFormState } from './SequenceForm';

export const actionToState = (settings: NodeEditorSettings): SequenceFormState => {
  let delayNode: SequenceFormState = {
    valid: true,
    days: '0',
    hours: '0',
    minutes: '0'
  };
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

export const stateToAction = (settings: NodeEditorSettings, state: SequenceFormState): any => {
  const { days, hours, minutes } = state;

  const delayInSeconds = parseInt(days) * 86400 + parseInt(hours) * 3600 + parseInt(minutes) * 60;

  const result = {
    type: Types.wait_for_time,
    uuid: getActionUUID(settings, Types.send_msg),
    delay: delayInSeconds.toString()
  };

  return result;
};
