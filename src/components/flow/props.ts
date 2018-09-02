import { UpdateLocalizations } from '~/components/nodeeditor/NodeEditor';
import { Type } from '~/config/typeConfigs';
import { AnyAction } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { AssetStore, RenderNode } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';
import { DispatchWithState, GetState } from '~/store/thunks';

export interface ActionFormProps {
    // action details
    nodeSettings: NodeEditorSettings;
    typeConfig: Type;
    assets: AssetStore;

    // update handlers
    updateAction(
        action: AnyAction,
        onUpdated?: (dispatch: DispatchWithState, getState: GetState) => void
    ): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

export interface RouterFormProps {
    nodeSettings: NodeEditorSettings;
    typeConfig: Type;

    assets: AssetStore;

    // update handlers
    updateRouter(renderNode: RenderNode): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

export interface LocalizationFormProps {
    language: Asset;
    nodeSettings: NodeEditorSettings;
    updateLocalizations(languageCode: string, localizations: any[]): UpdateLocalizations;
    onClose(canceled: boolean): void;
}
