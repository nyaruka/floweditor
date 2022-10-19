import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { AnyAction, CallSheets, Delay } from 'flowTypes';
import { FormEntry, NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import { RouterTypes, SwitchRouter } from 'flowTypes';
import { createRenderNode, createWebhookBasedNode, resolveRoutes } from '../helpers';

import { DEFAULT_OPERAND } from 'components/nodeeditor/constants';
import { SheetFormState } from '../sheet/SheetForm';
import { getType } from 'config/typeConfigs';

export const nodeToState = (settings: NodeEditorSettings): SheetFormState => {
  let result_name: StringEntry = { value: 'sheet' };
  let row: StringEntry = { value: '' };

  let sheet: FormEntry = { value: null };
  if (
    getType(settings.originalNode) === Types.call_sheet ||
    (settings.originalAction && settings.originalAction.type === Types.call_sheet)
  ) {
    let action = settings.originalAction as CallSheets;

    console.log(action);
    // look for any run result actions
    if (action.type === Types.call_sheet) {
      const callSheet = action as CallSheets;
      row.value = callSheet.row;
      result_name.value = callSheet.result_name;
      sheet.value = {};
      sheet.value.id = callSheet.sheet_id;
      sheet.value.name = callSheet.name;
      sheet.value.url = callSheet.url;
    }
  }

  return {
    sheet,
    row,
    result_name,
    valid: true
  };
};

export const stateToNode = (settings: NodeEditorSettings, state: SheetFormState): any => {
  const { sheet, result_name, row } = state;

  const newAction: CallSheets = {
    url: sheet.value.url,
    row: row.value,
    result_name: result_name.value,
    sheet_id: sheet.value.id,
    name: sheet.value.name,
    type: Types.call_sheet,
    uuid: getActionUUID(settings, Types.call_sheet)
  };

  return createWebhookBasedNode(newAction, settings.originalNode, false);
};
