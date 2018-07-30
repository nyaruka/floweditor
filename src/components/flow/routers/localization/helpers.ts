import { Case, Exit, SwitchRouter } from '~/flowTypes';
import { LocalizedObject } from '~/services/Localization';
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

export const getLocalizedObjects = (
    nodeSettings: NodeEditorSettings,
    localizedType: LocalizedType
): Exit[] | Case[] => {
    const filtered: any = [];

    let items: Exit[] | Case[] = nodeSettings.originalNode.node.exits;
    if (localizedType === LocalizedType.Case) {
        items = (nodeSettings.originalNode.node.router as SwitchRouter).cases;
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
