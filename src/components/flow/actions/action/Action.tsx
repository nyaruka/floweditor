import { react as bindCallbacks } from 'auto-bind';
import * as classNames from 'classnames/bind';
import * as React from 'react';
import { EditorConsumer, EditorState } from '~/components/context/editor/EditorContext';
import { FlowConsumer, FlowState } from '~/components/context/flow/FlowContext';
import * as styles from '~/components/flow/actions/action/Action.scss';
import * as shared from '~/components/shared.scss';
import TitleBar from '~/components/titlebar/TitleBar';
import { ConfigProviderContext, fakePropType } from '~/config/ConfigProvider';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { Action, AnyAction, LocalizationMap } from '~/flowTypes';
import { RenderNode } from '~/store/flowContext';
import { createClickHandler, getLocalization } from '~/utils';

export interface ActionProps {
    renderNode: RenderNode;
    thisNodeDragging: boolean;
    first: boolean;
    action: AnyAction;
    localization: LocalizationMap;
    render: (action: AnyAction) => React.ReactNode;

    editorState?: EditorState;
    flowState?: FlowState;
}

export const actionContainerSpecId = 'action-container';
export const actionOverlaySpecId = 'action-overlay';
export const actionInteractiveDivSpecId = 'interactive-div';
export const actionBodySpecId = 'action-body';

const cx = classNames.bind({ ...shared, ...styles });

// Note: this needs to be a ComponentClass in order to work w/ react-flip-move
export class ActionWrapper extends React.Component<ActionProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: ActionProps, context: ConfigProviderContext) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/]
        });
    }

    public onClick(event: React.MouseEvent<HTMLDivElement>): void {
        const target = event.target as any;

        const showAdvanced =
            target && target.attributes && target.getAttribute('data-advanced') === 'true';

        if (!this.props.thisNodeDragging) {
            event.preventDefault();
            event.stopPropagation();
            this.props.flowState.mutator.openNodeEditor({
                originalNode: this.props.renderNode,
                originalAction: this.props.action,
                showAdvanced
            });
        }
    }

    private onRemoval(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();
        this.props.flowState.mutator.removeAction(this.props.renderNode, this.props.action);
    }

    private onMoveUp(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();

        this.props.flowState.mutator.moveActionUp(this.props.renderNode, this.props.action);
    }

    public getAction(): Action {
        // if we are translating, us our localized version
        if (this.props.editorState.translating) {
            const localization = getLocalization(
                this.props.action,
                this.props.localization,
                this.props.editorState.language
            );
            return localization.getObject() as AnyAction;
        }

        return this.props.action;
    }

    private getClasses(): string {
        const localizedKeys = [];
        let missingLocalization = false;

        if (this.props.editorState.translating) {
            if (
                this.props.action.type === Types.send_msg ||
                this.props.action.type === Types.send_broadcast
            ) {
                localizedKeys.push('text');
            }

            if (localizedKeys.length !== 0) {
                const localization = getLocalization(
                    this.props.action,
                    this.props.localization,
                    this.props.editorState.language
                );

                if (localization.isLocalized()) {
                    for (const key of localizedKeys) {
                        if (!(key in localization.localizedKeys)) {
                            missingLocalization = true;
                            break;
                        }
                    }
                } else {
                    missingLocalization = true;
                }
            }
        }

        return cx({
            [styles.action]: true,
            [styles.has_router]:
                this.props.renderNode.node.hasOwnProperty('router') &&
                this.props.renderNode.node.router !== null,
            [styles.translating]: this.props.editorState.translating,
            [styles.not_localizable]:
                this.props.editorState.translating && localizedKeys.length === 0,
            [styles.missing_localization]: missingLocalization
        });
    }

    public render(): JSX.Element {
        const { name } = getTypeConfig(this.props.action.type);
        const classes = this.getClasses();
        const actionToInject = this.getAction();
        const titleBarClass = shared[this.props.action.type] || shared.missing;
        const actionClass = styles[this.props.action.type] || styles.missing;
        const showRemoval = !this.props.editorState.translating;
        const showMove = !this.props.first && !this.props.editorState.translating;

        return (
            <div
                id={`action-${this.props.action.uuid}`}
                className={classes}
                data-spec={actionContainerSpecId}
            >
                <div className={styles.overlay} data-spec={actionOverlaySpecId} />
                <div {...createClickHandler(this.onClick)} data-spec={actionInteractiveDivSpecId}>
                    <TitleBar
                        __className={titleBarClass}
                        title={name}
                        onRemoval={this.onRemoval}
                        showRemoval={showRemoval}
                        showMove={showMove}
                        onMoveUp={this.onMoveUp}
                    />
                    <div className={styles.body + ' ' + actionClass} data-spec={actionBodySpecId}>
                        {this.props.render(actionToInject)}
                    </div>
                </div>
            </div>
        );
    }
}

export default React.forwardRef((props: any) => (
    <div>
        <EditorConsumer>
            {editorState => (
                <FlowConsumer>
                    {flowState => (
                        <ActionWrapper {...props} flowState={flowState} editorState={editorState} />
                    )}
                </FlowConsumer>
            )}
        </EditorConsumer>
    </div>
));
