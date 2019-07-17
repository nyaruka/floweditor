import { Types } from 'config/interfaces';
import { getType } from 'config/typeConfigs';
import { Case, Category, SwitchRouter } from 'flowTypes';
import { LocalizedObject } from 'services/Localization';
import { RenderNode } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';

export enum LocalizedType {
  Category,
  Case
}

export const getOriginalCase = (nodeSettings: NodeEditorSettings, uuid: string) => {
  const cases = (nodeSettings.originalNode.node.router as SwitchRouter).cases;
  return cases.find((item: any) => item.uuid === uuid);
};

export const getOriginalCategory = (nodeSettings: NodeEditorSettings, uuid: string) => {
  const items = nodeSettings.originalNode.node.router.categories;
  return items.find((item: any) => item.uuid === uuid);
};

export const hasLocalizableCases = (renderNode: RenderNode) => {
  const type = getType(renderNode);
  return type === Types.wait_for_response || type === Types.split_by_expression;
};

export const getLocalizedObjects = (
  nodeSettings: NodeEditorSettings,
  localizedType: LocalizedType
): Category[] | Case[] => {
  const filtered: any = [];

  let items: Category[] | Case[] = nodeSettings.originalNode.node.router.categories;
  if (localizedType === LocalizedType.Case) {
    if (hasLocalizableCases(nodeSettings.originalNode)) {
      items = (nodeSettings.originalNode.node.router as SwitchRouter).cases;
    } else {
      items = [];
    }
  }

  for (const original of items) {
    const [localized] = nodeSettings.localizations.filter(
      (localizedObject: LocalizedObject) => localizedObject.getObject().uuid === original.uuid
    );

    if (localized.isLocalized()) {
      filtered.push(localized.getObject());
    } else {
      filtered.push({ uuid: original.uuid });
    }
  }
  return filtered;
};
