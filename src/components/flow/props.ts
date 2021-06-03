import { Type } from 'config/interfaces';
import { AnyAction, ContactProperties, FlowIssue } from 'flowTypes';
import { Asset, AssetStore, AssetType, RenderNode } from 'store/flowContext';
import { NodeEditorSettings } from 'store/nodeEditor';
import { DispatchWithState, GetState } from 'store/thunks';
import { titleCase } from 'utils';

export interface IssueProps {
  helpArticles: { [key: string]: string };
  issues: FlowIssue[];
}

export interface ActionFormProps extends IssueProps {
  // action details
  nodeSettings: NodeEditorSettings;
  typeConfig: Type;
  assetStore: AssetStore;

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

export interface RouterFormProps extends IssueProps {
  nodeSettings: NodeEditorSettings;
  typeConfig: Type;

  assetStore: AssetStore;

  // update handlers
  updateRouter(renderNode: RenderNode): void;

  // modal notifiers
  onTypeChange(config: Type): void;
  onClose(canceled: boolean): void;
}

export interface LocalizationFormProps extends IssueProps {
  language: Asset;
  nodeSettings: NodeEditorSettings;
  updateLocalizations(languageCode: string, localizations: any[]): void;
  onClose(canceled: boolean): void;
  helpArticles: { [key: string]: string };
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

export const STATUS_PROPERTY: Asset = {
  name: titleCase(ContactProperties.Status),
  id: ContactProperties.Status,
  type: AssetType.ContactProperty
};
