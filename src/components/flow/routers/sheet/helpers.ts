import { getActionUUID } from 'components/flow/actions/helpers';
import { Types } from 'config/interfaces';
import { LinkSheets } from 'flowTypes';
import { FormEntry, NodeEditorSettings, StringEntry } from 'store/nodeEditor';
import {} from 'flowTypes';
import { createWebhookBasedNode } from '../helpers';

import { SheetFormState } from '../sheet/SheetForm';
import { getType } from 'config/typeConfigs';

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

  let sheet: FormEntry = { value: null };
  if (
    getType(settings.originalNode) === Types.split_by_webhook ||
    (settings.originalAction && settings.originalAction.type === Types.link_google_sheet)
  ) {
    let action = getOriginalAction(settings);

    // look for any run result actions
    if (action.type === Types.link_google_sheet) {
      const callSheet = action as LinkSheets;
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

  const newAction: LinkSheets = {
    url: sheet.value.url,
    row: row.value,
    result_name: result_name.value,
    sheet_id: sheet.value.id,
    name: sheet.value.name,
    type: Types.link_google_sheet,
    uuid: getActionUUID(settings, Types.link_google_sheet)
  };

  return createWebhookBasedNode(newAction, settings.originalNode, false);
};
