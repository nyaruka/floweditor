import {
  Contact,
  Endpoints,
  Group,
  RecipientsAction,
  AnyAction,
  RenderAction,
  WithIssues,
  FlowIssue,
  FlowIssueType
} from 'flowTypes';
import * as React from 'react';
import { Asset, AssetType } from 'store/flowContext';
import { FormEntry, NodeEditorSettings, ValidationFailure } from 'store/nodeEditor';
import { createUUID } from 'utils';
import { Trans } from 'react-i18next';

const styles = require('components/shared.module.scss');

export const renderIssues = (issues: FlowIssue[]): JSX.Element => {
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div className={styles.issues}>
      {issues.map((issue: FlowIssue, num: Number) => {
        const key = issue.node_uuid + issue.action_uuid + num;
        return renderIssue(issue, key);
      })}
    </div>
  );
};

export const renderIssue = (issue: FlowIssue, key: string): JSX.Element => {
  if (issue.type === FlowIssueType.MISSING_DEPENDENCY) {
    return (
      <div key={key} className={styles.issue}>
        <Trans
          values={{
            name: issue.dependency.name || issue.dependency.key,
            type: issue.dependency.type
          }}
        >
          Cannot find a [[type]] for <span className="emphasize">[[name]]</span>
        </Trans>
      </div>
    );
  }

  // worst case, defer to the default description
  return (
    <div key={key} className={styles.issue}>
      {issue.description}
    </div>
  );
};

export const getActionUUID = (nodeSettings: NodeEditorSettings, currentType: string): string => {
  if (nodeSettings.originalAction && nodeSettings.originalAction.type === currentType) {
    return nodeSettings.originalAction.uuid;
  }
  return createUUID();
};

export const getRecipients = (action: RecipientsAction & WithIssues): Asset[] => {
  let selected: any[] = (action.groups || []).map((group: Group) => {
    return {
      id: group.uuid,
      name: group.name,
      type: AssetType.Group
    };
  });

  selected = selected.concat(
    (action.contacts || []).map((contact: Contact) => {
      return { id: contact.uuid, name: contact.name, type: AssetType.Contact, missing: false };
    })
  );

  selected = selected.concat(
    (action.legacy_vars || []).map((expression: string) => {
      return { id: expression, name: expression, type: AssetType.Expression, missing: false };
    })
  );

  return selected;
};

export const renderAssetList = (
  assets: Asset[],
  max: number = 10,
  endpoints: Endpoints
): JSX.Element[] => {
  // show our missing ones first
  return assets.reduce((elements, asset, idx) => {
    if (idx <= max - 2 || assets.length === max) {
      elements.push(renderAsset(asset, endpoints));
    } else if (idx === max - 1) {
      elements.push(<div key="ellipses">+{assets.length - max + 1} more</div>);
    }
    return elements;
  }, []);
};

export const renderAsset = (asset: Asset, endpoints: Endpoints) => {
  let assetBody = null;

  switch (asset.type) {
    case AssetType.Classifier:
      assetBody = (
        <Trans i18nKey="assets.classifier" values={{ name: asset.name }}>
          Call [[name]] classifier
        </Trans>
      );
      break;
    case AssetType.Group:
      assetBody = (
        <>
          <span className={`${styles.node_group} fe-group`} />
          {asset.name}
        </>
      );
      break;
    case AssetType.Label:
      assetBody = (
        <>
          <span className={`${styles.node_label} fe-label`} />
          {asset.name}
        </>
      );
      break;
    case AssetType.Flow:
      assetBody = (
        <>
          <span className={`${styles.node_label} fe-split`} />
          <a
            onMouseDown={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseUp={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            href={`${endpoints.editor}/${asset.id}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {asset.name}
          </a>
        </>
      );
      break;
  }

  if (!assetBody) {
    assetBody = asset.name;
  }

  return (
    <div className={`${styles.node_asset}`} key={asset.id}>
      {assetBody}
    </div>
  );
};

export const getAllErrors = (entry: FormEntry): ValidationFailure[] => {
  return entry ? entry.validationFailures || [] : [];
};

export const hasErrors = (entry: FormEntry): boolean => {
  return getAllErrors(entry).length > 0;
};

export const getExpressions = (assets: Asset[]): any[] => {
  return assets
    .filter((asset: Asset) => asset.type === AssetType.Expression)
    .map((asset: Asset) => {
      return asset.id;
    });
};

export const getRecipientsByAsset = (assets: Asset[], type: AssetType): any[] => {
  return assets
    .filter((asset: Asset) => asset.type === type)
    .map((asset: Asset) => {
      return { uuid: asset.id, name: asset.name };
    });
};

export const createRenderAction = (action: AnyAction, issues: FlowIssue[] = []): RenderAction => {
  return { ...action, issues };
};
