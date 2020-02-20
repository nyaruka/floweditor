import { UpdateLocalizations } from 'components/nodeeditor/NodeEditor';
import { Type } from 'config/interfaces';
import { AnyAction, ContactProperties, FlowIssue } from 'flowTypes';
import { Asset, AssetStore, AssetType, RenderNode } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';
import { DispatchWithState, GetState } from 'store/thunks';
import { titleCase } from 'utils';
import { CompletionSchema } from 'utils/completion';

export interface ActionFormProps {
  // action details
  nodeSettings: NodeEditorSettings;
  typeConfig: Type;
  assetStore: AssetStore;
  completionSchema: CompletionSchema;
  issues: FlowIssue[];

  addAsset(assetType: string, asset: Asset): void;

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

  assetStore: AssetStore;
  issues: FlowIssue[];

  // update handlers
  updateRouter(renderNode: RenderNode): void;

  // modal notifiers
  onTypeChange(config: Type): void;
  onClose(canceled: boolean): void;
}

export interface LocalizationFormProps {
  issues: FlowIssue[];
  language: Asset;
  nodeSettings: NodeEditorSettings;
  updateLocalizations(languageCode: string, localizations: any[]): UpdateLocalizations;
  onClose(canceled: boolean): void;
}

export const NAME_PROPERTY: Asset = {
  name: titleCase(ContactProperties.Name),
  id: ContactProperties.Name,
  type: AssetType.ContactProperty
};

export const CHANNEL_PROPERTY: Asset = {
  name: titleCase(ContactProperties.Channel),
  id: ContactProperties.Channel,
  type: AssetType.ContactProperty
};

export const LANGUAGE_PROPERTY: Asset = {
  name: titleCase(ContactProperties.Language),
  id: ContactProperties.Language,
  type: AssetType.ContactProperty
};
