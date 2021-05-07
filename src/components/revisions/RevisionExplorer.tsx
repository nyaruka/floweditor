import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import { PopTab } from 'components/poptab/PopTab';
import dateFormat from 'dateformat';
import { getAssets, getFlowDetails } from 'external';
import { FlowDefinition, SPEC_VERSION, FlowDetails, FlowIssue, FlowMetadata } from 'flowTypes';
import React from 'react';
import { Asset, AssetStore } from 'store/flowContext';
import { renderIf } from 'utils';

import styles from './RevisionExplorer.module.scss';
import i18n from 'config/i18n';
import { PopTabType } from 'config/interfaces';

const cx: any = classNames.bind(styles);

export interface User {
  email: string;
  name: string;
}

export interface SaveResult {
  revision: Revision;
  issues: FlowIssue[];
  metadata: FlowMetadata;
}

export interface Revision {
  id: number;
  version: string;
  revision: number;
  created_on: string;
  user: User;
  current: boolean;
}

export interface RevisionExplorerProps {
  assetStore: AssetStore;
  loadFlowDefinition: (details: FlowDetails, assetStore: AssetStore) => void;
  createNewRevision: () => void;
  onToggled: (visible: boolean, tab: PopTabType) => void;
  utc?: boolean;
  popped: string;
}

export interface RevisionExplorerState {
  revisions: Asset[];
  revision: Asset;
  definition: FlowDefinition;
  visible: boolean;
}

export class RevisionExplorer extends React.Component<
  RevisionExplorerProps,
  RevisionExplorerState
> {
  constructor(props: RevisionExplorerProps) {
    super(props);
    this.state = {
      revisions: [],
      revision: null,
      definition: null,
      visible: false
    };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public handleUpdateRevisions(): Promise<void> {
    if (this.props.assetStore !== null) {
      const assets = this.props.assetStore.revisions;
      return getAssets(
        assets.endpoint + '?version=' + SPEC_VERSION,
        assets.type,
        assets.id || 'id'
      ).then((remoteAssets: Asset[]) => {
        if (remoteAssets.length > 0) {
          remoteAssets[0].content.current = true;
        }
        this.setState({ revisions: remoteAssets });
      });
    }
  }

  public handleTabClicked(): void {
    this.props.onToggled(!this.state.visible, PopTabType.REVISION_HISTORY);

    this.setState(
      (prevState: RevisionExplorerState) => {
        return { visible: !prevState.visible };
      },
      () => {
        if (this.state.visible) {
          this.handleUpdateRevisions();
        } else {
          if (this.state.revision && this.state.revision.id !== this.state.revisions[0].id) {
            getFlowDetails(this.props.assetStore.revisions, this.state.revisions[0].id).then(
              (details: FlowDetails) => {
                this.props.loadFlowDefinition(details, this.props.assetStore);
                this.setState({ revision: null });
              }
            );
          }
        }
      }
    );
  }

  public onRevisionClicked = (
    revision: Asset
  ): ((event: React.MouseEvent<HTMLDivElement>) => void) => {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      event.preventDefault();
      getFlowDetails(this.props.assetStore.revisions, revision.id).then((details: FlowDetails) => {
        this.props.loadFlowDefinition(details, this.props.assetStore);
        this.setState({ revision });
      });
    };
  };

  public onRevertClicked = (
    revision: Asset
  ): ((event: React.MouseEvent<HTMLDivElement>) => void) => {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      event.preventDefault();
      this.props.createNewRevision();
      this.setState({ visible: false, revision: null });
    };
  };

  public render(): JSX.Element {
    const classes = cx({
      [styles.visible]: this.state.visible,
      [styles.hidden]: this.props.popped && this.props.popped !== PopTabType.REVISION_HISTORY
    });

    return (
      <div className={classes}>
        <div className={styles.mask} />
        <PopTab
          header={i18n.t('revisions.header', 'Revisions')}
          color="#8e5ea7"
          icon="fe-time"
          label={i18n.t('revisions.label', 'Revision History')}
          top="360px"
          visible={this.state.visible}
          onShow={this.handleTabClicked}
          onHide={this.handleTabClicked}
        >
          <div className={styles.explorer_wrapper}>
            <div className={styles.explorer}>
              <div className={styles.revisions}>
                {this.state.revisions.map((asset: Asset) => {
                  const revision = asset.content as Revision;

                  const isSelected = this.state.revision && asset.id === this.state.revision.id;

                  const selectedClass = revision.current || isSelected ? styles.selected : '';

                  return (
                    <div
                      className={styles.revision + ' ' + selectedClass}
                      key={'revision_' + asset.id}
                      onClick={this.onRevisionClicked(asset)}
                    >
                      {renderIf(revision.current)(
                        <div className={styles.button + ' ' + styles.current}>
                          {i18n.t('revisions.current', 'current')}
                        </div>
                      )}
                      {renderIf(isSelected && !revision.current)(
                        <div onClick={this.onRevertClicked(asset)} className={styles.button}>
                          {i18n.t('revisions.revert', 'revert')}
                        </div>
                      )}
                      <div className={styles.created_on}>
                        {dateFormat(
                          new Date(revision.created_on),
                          'mmmm d, yyyy, h:MM TT',
                          this.props.utc
                        )}
                      </div>
                      <div className={styles.email}>
                        {revision.user.name || revision.user.email}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </PopTab>
      </div>
    );
  }
}
