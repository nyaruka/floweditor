import {
  Contact,
  Endpoints,
  Group,
  RecipientsAction,
  FlowIssue,
  FlowIssueType,
  BroadcastMsg,
  SendMsg,
  ComposeAttachment
} from 'flowTypes';
import * as React from 'react';
import { Asset, AssetType } from 'store/flowContext';
import { FormEntry, NodeEditorSettings, StringEntry, ValidationFailure } from 'store/nodeEditor';
import { createUUID } from 'utils';
import { Trans } from 'react-i18next';
import shared from 'components/shared.module.scss';
import { showHelpArticle } from 'external';
import { IssueProps } from '../props';
import { SendBroadcastFormState } from './sendbroadcast/SendBroadcastForm';
import { SendMsgFormState } from './sendmsg/SendMsgForm';
import { MaxOf640Chars, MaxOfThreeItems, shouldRequireIf, validate } from 'store/validators';
import i18n from 'config/i18n';

export const renderIssues = (issueProps: IssueProps): JSX.Element => {
  const { issues, helpArticles } = issueProps;
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: '10px 0px' }}>
      {issues.map((issue: FlowIssue, num: Number) => {
        const key = issue.node_uuid + issue.action_uuid + num;
        return (
          <div
            style={{ margin: '6px 0px', display: 'flex', fontSize: '14px', color: 'tomato' }}
            key={key}
          >
            <div
              style={{ marginRight: '8px', marginTop: '-2px', fontSize: '18px' }}
              className={`fe-warning`}
            />
            <div>{renderIssue(issue, helpArticles)}</div>
          </div>
        );
      })}
    </div>
  );
};

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

export const getActionUUID = (nodeSettings: NodeEditorSettings, currentType: string): string => {
  if (nodeSettings.originalAction && nodeSettings.originalAction.type === currentType) {
    return nodeSettings.originalAction.uuid;
  }
  return createUUID();
};

export const getEmptyComposeValue = (): string => {
  return JSON.stringify({ text: '', attachments: [] });
};

export const getComposeActionToState = (action: SendMsg | BroadcastMsg = null): string => {
  if (!action) {
    return getEmptyComposeValue();
  }
  return action.compose;
};

export const validateCompose = (composeValue: string, submitting: boolean = false): StringEntry => {
  let composeUpdate: StringEntry;

  // validate empty compose value
  if (composeValue === getEmptyComposeValue()) {
    composeUpdate = validate(i18n.t('forms.compose', 'Compose'), '', [shouldRequireIf(submitting)]);
    composeUpdate.value = composeValue;
    if (composeUpdate.validationFailures.length > 0) {
      let composeErrMsg = composeUpdate.validationFailures[0].message;
      composeErrMsg = composeErrMsg.replace('Compose is', 'Text or attachments are');
      composeUpdate.validationFailures[0].message = composeErrMsg;
    }
    return composeUpdate;
  }

  // validate populated compose value
  composeUpdate = validate(i18n.t('forms.compose', 'Compose'), composeValue, [
    shouldRequireIf(submitting)
  ]);
  // validate inner text value
  const composeTextValue = getComposeByAsset(composeValue, AssetType.ComposeText);
  const composeTextResult = validate(i18n.t('forms.compose', 'Compose'), composeTextValue, [
    MaxOf640Chars
  ]);
  if (composeTextResult.validationFailures.length > 0) {
    let textErrMsg = composeTextResult.validationFailures[0].message;
    textErrMsg = textErrMsg.replace('Compose cannot be more than', 'Maximum allowed text is');
    composeTextResult.validationFailures[0].message = textErrMsg;
    composeUpdate.validationFailures = [
      ...composeUpdate.validationFailures,
      ...composeTextResult.validationFailures
    ];
  }
  // validate inner attachments value
  const composeAttachmentsValue = getComposeByAsset(composeValue, AssetType.ComposeAttachments);
  const composeAttachmentsResult = validate(
    i18n.t('forms.compose', 'Compose'),
    composeAttachmentsValue,
    [MaxOfThreeItems]
  );
  if (composeAttachmentsResult.validationFailures.length > 0) {
    let attachmentsErrMsg = composeAttachmentsResult.validationFailures[0].message;
    attachmentsErrMsg = attachmentsErrMsg
      .replace('Compose cannot have more than', 'Maximum allowed attachments is')
      .replace('entries', 'files');
    composeAttachmentsResult.validationFailures[0].message = attachmentsErrMsg;
    composeUpdate.validationFailures = [
      ...composeUpdate.validationFailures,
      ...composeAttachmentsResult.validationFailures
    ];
  }
  return composeUpdate;
};

export const getComposeStateToAction = (state: SendMsgFormState | SendBroadcastFormState): any => {
  const compose = state.compose.value;
  const text = getComposeByAsset(compose, AssetType.ComposeText);
  const attachments = getComposeByAsset(compose, AssetType.ComposeAttachments).map(
    (attachment: ComposeAttachment) => `${attachment.content_type}:${attachment.url}`
  );
  return [compose, text, attachments];
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

export const getRecipientsStateToAction = (state: SendBroadcastFormState): any => {
  const legacy_vars = getExpressions(state.recipients.value);
  const contacts = getRecipientsByAsset(state.recipients.value, AssetType.Contact);
  const groups = getRecipientsByAsset(state.recipients.value, AssetType.Group);
  return [legacy_vars, contacts, groups];
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
          <span className={`${shared.node_group} fe-group`} />
          {asset.name}
        </>
      );
      break;
    case AssetType.Label:
      assetBody = (
        <>
          <span className={`${shared.node_label} fe-label`} />
          {asset.name}
        </>
      );
      break;
    case AssetType.Flow:
      assetBody = (
        <>
          <span className={`${shared.node_label} fe-split`} />
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
  return JSON.parse(value)[asset];
};
