import {
  AirtimeRouterFormState,
  AirtimeTransferEntry
} from 'components/flow/routers/airtime/AirtimeRouterForm';
import { createServiceCallSplitNode } from 'components/flow/routers/helpers';
import { Operators, Types } from 'config/interfaces';
import { SwitchRouter, TransferAirtime } from 'flowTypes';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';
import { createUUID } from 'utils';

export const nodeToState = (settings: NodeEditorSettings): AirtimeRouterFormState => {
  const originalAction = getOriginalAction(settings);
  const router = settings.originalNode.node.router as SwitchRouter;

  let resultName = { value: '' };
  let valid = false;

  const amounts: AirtimeTransferEntry[] = [];
  if (originalAction && originalAction.type === Types.transfer_airtime) {
    Object.keys(originalAction.amounts).forEach((key: string) => {
      amounts.push({
        value: { code: key, amount: '' + originalAction.amounts[key] }
      });
    });
    resultName = { value: router.result_name };
    valid = true;
  }

  return {
    valid,
    amounts,
    resultName
  };
};

export const stateToNode = (
  settings: NodeEditorSettings,
  state: AirtimeRouterFormState
): RenderNode => {
  let uuid = createUUID();
  const originalAction = getOriginalAction(settings);
  if (originalAction) {
    uuid = originalAction.uuid;
  }

  const amounts = {};
  state.amounts.forEach((entry: AirtimeTransferEntry) => {
    if (entry.value.amount.trim().length > 0) {
      (amounts as any)[entry.value.code] = Number(entry.value.amount);
    }
  });

  const newAction: TransferAirtime = {
    uuid,
    type: Types.transfer_airtime,
    amounts
  };

  return createServiceCallSplitNode(
    newAction,
    settings.originalNode,
    '@locals._new_transfer',
    Operators.has_text,
    [],
    state.resultName.value
  );
};

export const getOriginalAction = (settings: NodeEditorSettings): TransferAirtime => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions?.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.transfer_airtime) {
    return action as TransferAirtime;
  }
};
