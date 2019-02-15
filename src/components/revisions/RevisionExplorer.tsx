import { react as bindCallbacks } from 'auto-bind';
import dateFormat = require('dateformat');
import * as React from 'react';
import { getAssets, getFlowDefinition } from '~/external';
import { FlowDefinition } from '~/flowTypes';
import { Asset, AssetStore } from '~/store/flowContext';
import { loadFlowDefinition } from '~/store/thunks';
import { renderIf } from '~/utils';

import * as styles from './RevisionExplorer.scss';

export interface User {
    email: string;
    name: string;
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
    loadFlowDefinition: (definition: FlowDefinition, assetStore: AssetStore) => void;
    utc?: boolean;
}

export interface RevisionExplorerState {
    revisions: Asset[];
    revision: Revision;
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
            return getAssets(assets.endpoint, assets.type, assets.id || 'id').then(
                (remoteAssets: Asset[]) => {
                    if (remoteAssets.length > 0) {
                        remoteAssets[0].content.current = true;
                    }
                    this.setState({ revisions: remoteAssets });
                }
            );
        }
    }

    public handleTabClicked(): void {
        this.setState(
            (prevState: RevisionExplorerState) => {
                return { visible: !prevState.visible };
            },
            () => {
                if (this.state.visible) {
                    this.handleUpdateRevisions();
                } else {
                    getFlowDefinition(this.props.assetStore.revisions).then(
                        (definition: FlowDefinition) => {
                            this.props.loadFlowDefinition(definition, this.props.assetStore);
                            this.setState({ revision: null });
                        }
                    );
                }
            }
        );
    }

    public handleRevisionClicked(revision: Asset): void {
        getFlowDefinition(this.props.assetStore.revisions, revision.id).then(
            (definition: FlowDefinition) => {
                this.props.loadFlowDefinition(definition, this.props.assetStore);
                this.setState({ revision: revision.content });
            }
        );
    }

    public render(): JSX.Element {
        return (
            <div className={this.state.visible ? styles.visible : ''}>
                <div className={styles.mask} />
                <div className={styles.explorerWrapper}>
                    <div className={styles.tab} onClick={this.handleTabClicked}>
                        {this.state.visible ? 'Hide Revisions' : 'Revisions'}
                    </div>

                    <div className={styles.explorer}>
                        <div className={styles.revisions}>
                            {this.state.revisions.map((asset: Asset) => {
                                const revision = asset.content as Revision;

                                const isSelected =
                                    this.state.revision &&
                                    revision.revision === this.state.revision.revision;

                                const selectedClass =
                                    revision.current || isSelected ? styles.selected : '';

                                return (
                                    <div
                                        className={styles.revision + ' ' + selectedClass}
                                        key={'revision_' + asset.id}
                                        onClick={() => {
                                            this.handleRevisionClicked(asset);
                                        }}
                                    >
                                        {renderIf(revision.current)(
                                            <div className={styles.button + ' ' + styles.current}>
                                                current
                                            </div>
                                        )}
                                        {renderIf(isSelected && !revision.current)(
                                            <div className={styles.button}>revert</div>
                                        )}
                                        <div className={styles.createdOn}>
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
            </div>
        );
    }
}
