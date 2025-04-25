import { createServiceCallSplitNode } from 'components/flow/routers/helpers';
import { Operators, Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { CallLLM, LLM } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';
import { LLMFormState } from './LLMForm';
import { createUUID } from 'utils';

export const getOriginalAction = (settings: NodeEditorSettings): CallLLM => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.call_llm) {
    return action as CallLLM;
  }
};

export const nodeToState = (settings: NodeEditorSettings): LLMFormState => {
  const state: LLMFormState = {
    llm: null,
    instructions: { value: '' },
    input: { value: '@input' },
    valid: false
  };

  if (getType(settings.originalNode) === Types.split_by_webhook) {
    const action = getOriginalAction(settings) as CallLLM;
    state.instructions = { value: action.instructions };
    state.input = { value: action.input };
    state.llm = { value: action.llm };
    state.valid = true;
  }
  return state;
};

export const stateToNode = (settings: NodeEditorSettings, state: LLMFormState): RenderNode => {
  let uuid = createUUID();

  const originalAction = getOriginalAction(settings);
  if (originalAction) {
    uuid = originalAction.uuid;
  }

  const newAction: CallLLM = {
    uuid,
    type: Types.call_llm,
    llm: state.llm.value as LLM,
    input: state.input.value,
    instructions: state.instructions.value,
    output_local: '_llm_output'
  };

  return createServiceCallSplitNode(
    newAction,
    settings.originalNode,
    '@locals._llm_output',
    Operators.has_only_text,
    ['<ERROR>'],
    '',
    true
  );
};
