import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import {
  createCaseProps,
  createRenderNode,
  hasCases,
  resolveRoutes
} from 'components/flow/routers/helpers';
import { ResponseRouterFormState } from 'components/flow/routers/response/ResponseRouterForm';
import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { Router, RouterTypes, SwitchRouter, Wait, WaitTypes } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { SequenceFormState } from './SequenceForm';

export const nodeToState = (settings: NodeEditorSettings): SequenceFormState => {
  console.log(settings);
  const delayNode: SequenceFormState = {
    valid: true,
    days: '0',
    hours: '0',
    minutes: '0'
  };

  if (delayNode.valid) {
    const delayInSeconds = parseInt(
      settings.originalNode.node.delay ? settings.originalNode.node.delay.time : '0'
    );
    delayNode.days = Math.floor(delayInSeconds / (3600 * 24)).toString();
    delayNode.hours = Math.floor((delayInSeconds % (3600 * 24)) / 3600).toString();
    delayNode.minutes = Math.floor((delayInSeconds % 3600) / 60).toString();
  }

  return delayNode;
};

export const stateToNode = (settings: NodeEditorSettings, state: SequenceFormState): RenderNode => {
  const { days, hours, minutes } = state;

  const delayInSeconds = parseInt(days) * 86400 + parseInt(hours) * 3600 + parseInt(minutes);

  let waitForTime = `Waiting for ${days !== '0' ? days + ' days ' : ''}  ${
    hours !== '0' ? hours + ' hours ' : ''
  } ${minutes !== '0' ? minutes + ' minutes ' : ''}`;

  if (delayInSeconds === 0) {
    waitForTime = 'Not waiting';
  }
  settings.originalNode.node.delay = {
    time: delayInSeconds.toString(),
    description: waitForTime
  };

  settings.originalNode.ui.type = Types.wait_for_time;

  return settings.originalNode;
};
