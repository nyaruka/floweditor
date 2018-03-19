import * as React from 'react';
import * as classNames from 'classnames/bind';
import { react as bindCallbacks } from 'auto-bind';
import { connect } from 'react-redux';
import { getTypeConfig, languagesPT } from '../../../config';
import { ConfigProviderContext } from '../../../config/ConfigProvider';
import { AnyAction, FlowDefinition, Languages, Node } from '../../../flowTypes';
import { moveActionUp, ReduxState, removeAction } from '../../../redux';
import { DispatchWithState, onOpenNodeEditor } from '../../../redux/actionCreators';
import { LocalizedObject } from '../../../services/Localization';
import { Language } from '../../LanguageSelector';
import * as shared from '../../shared.scss';
import TitleBar from '../../TitleBar';
import * as styles from './Action.scss';

export interface ActionWrapperProps {
    node: Node;
    action: AnyAction;
    thisNodeDragging: boolean;
    localization: LocalizedObject;
    first: boolean;
    userClickingAction: boolean;
    language: Language;
    translating: boolean;
    definition: FlowDefinition;
    render: (action: AnyAction) => React.ReactNode;
    onOpenNodeEditorAC: (node: Node, action: AnyAction, languages: Languages) => void;
    removeActionAC: (action: AnyAction) => void;
    moveActionUpAC: (action: AnyAction) => void;
}

const cx = classNames.bind({ ...shared, ...styles });

// Note: this needs to be a ComponentClass in order to work w/ react-flip-move
export class ActionWrapper extends React.Component<ActionWrapperProps> {
    private localizedKeys: string[] = [];

    public static contextTypes = {
        languages: languagesPT
    };

    constructor(props: ActionWrapperProps, context: ConfigProviderContext) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/]
        });
    }

    public onClick(event: React.MouseEvent<HTMLDivElement>): void {
        if (!this.props.thisNodeDragging) {
            event.preventDefault();
            event.stopPropagation();
            const ui = this.props.definition._ui.nodes[this.props.node.uuid];
            this.props.onOpenNodeEditorAC(
                this.props.node,
                this.props.action,
                this.context.languages
            );
        }
    }

    private onRemoval(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();

        this.props.removeActionAC(this.props.action);
    }

    private onMoveUp(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();

        this.props.moveActionUpAC(this.props.action);
    }

    private getClasses(): string {
        let missingLocalization = false;

        if (this.props.translating) {
            if (this.props.action.type === 'send_msg') {
                this.localizedKeys.push('text');
            }

            if (this.localizedKeys.length !== 0) {
                if (this.props.localization.isLocalized()) {
                    for (const key of this.localizedKeys) {
                        if (!(key in this.props.localization.localizedKeys)) {
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
                this.props.node.hasOwnProperty('router') && this.props.node.router !== null,
            [styles.translating]: this.props.translating,
            [styles.not_localizable]: this.props.translating && this.localizedKeys.length === 0,
            [styles.missing_localization]: missingLocalization
        });
    }

    public render(): JSX.Element {
        const { name } = getTypeConfig(this.props.action.type);
        const classes = this.getClasses();
        const anyAction = this.props.localization
            ? (this.props.localization.getObject() as AnyAction)
            : this.props.action;
        const titleBarClass = shared[this.props.action.type];
        const showRemoval = !this.props.translating;
        const showMove = !this.props.first && !this.props.translating;
        // const events = { onClick: !this.props.thisNodeDragging ? this.onClick : null };

        return (
            <div id={`action-${this.props.action.uuid}`} className={classes}>
                <div className={styles.overlay} />
                <div onMouseUp={this.onClick} data-spec="interactive-div">
                    <TitleBar
                        className={titleBarClass}
                        title={name}
                        onRemoval={this.onRemoval}
                        showRemoval={showRemoval}
                        showMove={showMove}
                        onMoveUp={this.onMoveUp}
                    />
                    <div className={styles.body}>{this.props.render(anyAction)}</div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({
    userClickingAction,
    language,
    translating,
    definition
}: ReduxState) => ({
    userClickingAction,
    language,
    translating,
    definition
});

const mapDispatchToProps = (dispatch: DispatchWithState) => ({
    onOpenNodeEditorAC: (node: Node, action: AnyAction, languages: Languages) =>
        dispatch(onOpenNodeEditor(node, action, languages)),
    removeActionAC: (action: AnyAction) => dispatch(removeAction(action)),
    moveActionUpAC: (action: AnyAction) => dispatch(moveActionUp(action))
});

const ConnectedActionWrapper = connect(mapStateToProps, mapDispatchToProps)(ActionWrapper);

export default ConnectedActionWrapper;
