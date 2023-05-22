import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { LinkSheets } from 'flowTypes';
import { FormEntry, NodeEditorSettings, StringEntry } from 'store/nodeEditor';

import { createWebhookBasedNode } from '../helpers';

import { SheetFormState } from '../sheet/SheetForm';
import { getType } from 'config/typeConfigs';

export const ACTION_OPTIONS = [{ name: 'Read', value: 'READ' }, { name: 'Write', value: 'WRITE' }];

export const getOriginalAction = (settings: NodeEditorSettings): LinkSheets => {
  const action =
    settings.originalAction ||
    (settings.originalNode.node.actions.length > 0 && settings.originalNode.node.actions[0]);

  if (action.type === Types.link_google_sheet) {
    return action as LinkSheets;
  }
};

export const nodeToState = (settings: NodeEditorSettings): SheetFormState => {
  let result_name: StringEntry = { value: 'sheet' };
  let row: StringEntry = { value: '' };
  let range: StringEntry = { value: '' };
  let row_data: FormEntry[] = [];
  let action_type: FormEntry = { value: ACTION_OPTIONS[0] };
  let sheet: FormEntry = { value: null };

  if (
    getType(settings.originalNode) === Types.split_by_webhook ||
    (settings.originalAction && settings.originalAction.type === Types.link_google_sheet)
  ) {
    let action = getOriginalAction(settings);

    // look for any run result actions
    if (action.type === Types.link_google_sheet) {
      const callSheet = action as LinkSheets;
      row_data = callSheet.row_data
        ? callSheet.row_data.map(row => ({
            value: row
          }))
        : [];
      if (callSheet.action_type) {
        action_type.value = ACTION_OPTIONS.filter(
          action => action.value === callSheet.action_type
        )[0];
      }

      row.value = callSheet.row;
      range.value = callSheet.range;
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
    valid: true,
    action_type,
    row_data,
    range
  };
};

export const stateToNode = (settings: NodeEditorSettings, state: SheetFormState): any => {
  const { sheet, result_name, row, row_data, action_type, range } = state;
  let newAction;
  const uuid = getActionUUID(settings, Types.link_google_sheet);
  const actionType = action_type.value.value;

  switch (actionType) {
    case 'READ':
      newAction = {
        url: sheet.value.url,
        row: row.value,
        action_type: actionType,
        result_name: result_name.value,
        sheet_id: sheet.value.id,
        name: sheet.value.name,
        type: Types.link_google_sheet,
        uuid
      };
      break;
    case 'WRITE':
      newAction = {
        url: sheet.value.url,
        row_data: row_data.filter(row => row.value !== '').map(row => row.value),
        sheet_id: sheet.value.id,
        name: sheet.value.name,
        action_type: actionType,
        range: range.value,
        type: Types.link_google_sheet,
        result_name: '',
        uuid
      };
      break;
  }

  return createWebhookBasedNode(newAction, settings.originalNode, false);
};
