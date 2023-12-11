import {
  Contact,
  Endpoints,
  Group,
  RecipientsAction,
  FlowIssue,
  FlowIssueType,
  BroadcastMsg
} from 'flowTypes';
import * as React from 'react';
import { Asset, AssetType } from 'store/flowContext';
import { FormEntry, NodeEditorSettings, ValidationFailure } from 'store/nodeEditor';
import { createUUID } from 'utils';
import { Trans } from 'react-i18next';
import shared from 'components/shared.module.scss';
import { showHelpArticle } from 'external';
import { IssueProps } from '../props';

export const renderIssue = (
  issue: FlowIssue,
  helpArticles: { [key: string]: string } = {}
): JSX.Element => {
  // worst case, defer to the default description
  let message: JSX.Element = <>{issue.description}</>;

  if (issue.type === FlowIssueType.MISSING_DEPENDENCY) {
    message = (
      <Trans
        i18nKey="issues.missing_dependency"
        values={{
          name: issue.dependency.name || issue.dependency.key,
          type: issue.dependency.type
        }}
      >
        Cannot find a [[type]] for <span className="emphasize">[[name]]</span>
      </Trans>
    );
  }

  if (issue.type === FlowIssueType.INVALID_REGEX) {
    message = (
      <Trans i18nKey="issues.legacy_extra" values={{ regex: issue.regex }}>
        Invalid regular expression found: [[regex]]
      </Trans>
    );
  }

  if (issue.type === FlowIssueType.LEGACY_EXTRA) {
    message = (
      <Trans i18nKey="issues.legacy_extra">Expressions should not reference @legacy_extra</Trans>
    );
  }

  const article = helpArticles[issue.type];
  if (article) {
    return (
      <div
        className={shared.issue_help}
        onClick={() => {
          showHelpArticle(article);
        }}
      >
        {message}
      </div>
    );
  }

  return message;
};

export const renderIssues = (issueProps: IssueProps): JSX.Element => {
  const { issues, helpArticles } = issueProps;
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: '10px 0px' }}>
      {issues.map((issue: FlowIssue, num: number) => {
        const key = issue.node_uuid + issue.action_uuid + num;
        return (
          <div
            style={{ margin: '6px 0px', display: 'flex', fontSize: '14px', color: 'tomato' }}
            key={key}
          >
            <temba-icon
              style={{ marginRight: '8px', marginTop: '-2px', fontSize: '18px' }}
              name="issue"
            ></temba-icon>
            <div>{renderIssue(issue, helpArticles)}</div>
          </div>
        );
      })}
    </div>
  );
};

export const getActionUUID = (nodeSettings: NodeEditorSettings, currentType: string): string => {
  if (nodeSettings.originalAction && nodeSettings.originalAction.type === currentType) {
    return nodeSettings.originalAction.uuid;
  }
  return createUUID();
};

export const getEmptyComposeValue = (): string => {
  return JSON.stringify({ text: '', attachments: [] });
};

export const getCompose = (action: BroadcastMsg = null): string => {
  if (!action) {
    return getEmptyComposeValue();
  }
  if (!action.compose) {
    return JSON.stringify({ und: { text: action.text, attachments: [] } });
  }
  return action.compose;
};

export const getRecipients = (action: RecipientsAction): Asset[] => {
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
      return { name: expression, value: expression, expression: true };
    })
  );

  return selected;
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
        <div style={{ display: 'inline-flex' }}>
          <temba-icon
            style={{ marginRight: 4 }}
            name="group"
            className={`${shared.node_group}`}
          ></temba-icon>
          {asset.name}
        </div>
      );
      break;
    case AssetType.Label:
      assetBody = (
        <div style={{ display: 'inline-flex' }}>
          <temba-icon
            style={{ marginRight: 4 }}
            name="label"
            className={`${shared.node_group}`}
          ></temba-icon>
          {asset.name}
        </div>
      );
      break;
    case AssetType.Flow:
      assetBody = (
        <div style={{ display: 'inline-flex' }}>
          <temba-icon
            style={{ marginRight: 4 }}
            name="flow"
            className={`${shared.node_group}`}
          ></temba-icon>
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
        </div>
      );
      break;
    case AssetType.Ticketer:
      assetBody = (
        <Trans i18nKey="assets.ticketer" values={{ name: asset.name }}>
          Open a new Ticket on [[name]]
        </Trans>
      );
      break;
  }

  if (!assetBody) {
    assetBody = asset.name;
  }

  return (
    <div className={`${shared.node_asset}`} key={asset.id || (asset as any).value}>
      {assetBody}
    </div>
  );
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

export const getAllErrors = (entry: FormEntry): ValidationFailure[] => {
  return entry ? entry.validationFailures || [] : [];
};

export const hasErrors = (entry: FormEntry): boolean => {
  return getAllErrors(entry).length > 0;
};

export const getAllErrorMessages = (entry: FormEntry): string[] => {
  const errors = getAllErrors(entry).map((failure: ValidationFailure) => failure.message);
  return errors;
};

export const getExpressions = (assets: any[]): any[] => {
  return assets
    .filter((asset: any) => asset.expression)
    .map((asset: any) => {
      return asset.value;
    });
};

export const getRecipientsByAsset = (assets: Asset[], type: AssetType): any[] => {
  return assets
    .filter((asset: Asset) => asset.type === type)
    .map((asset: Asset) => {
      return { uuid: asset.id, name: asset.name };
    });
};

export const getComposeByAsset = (value: string, asset: string): any | any[] => {
  const compose = JSON.parse(value);
  return compose['und'][asset];
};
