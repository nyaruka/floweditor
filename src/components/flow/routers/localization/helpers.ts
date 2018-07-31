import { Types } from '~/config/typeConfigs';
import { Case, Exit, SwitchRouter } from '~/flowTypes';
import { LocalizedObject } from '~/services/Localization';
import { RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';

export enum LocalizedType {
    Exit,
    Case
}

export const getOriginal = (
    nodeSettings: NodeEditorSettings,
    localizedType: LocalizedType,
    uuid: string
) => {
    let items = nodeSettings.originalNode.node.exits;
    if (localizedType === LocalizedType.Case) {
        items = (nodeSettings.originalNode.node.router as SwitchRouter).cases;
    }
    return items.find((item: any) => item.uuid === uuid);
};

export const hasLocalizableCases = (renderNode: RenderNode) => {
    const type = renderNode.ui.type;
    return type === Types.wait_for_response || type === Types.split_by_expression;
};

export const getLocalizedObjects = (
    nodeSettings: NodeEditorSettings,
    localizedType: LocalizedType
): Exit[] | Case[] => {
    const filtered: any = [];

    let items: Exit[] | Case[] = nodeSettings.originalNode.node.exits;
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
