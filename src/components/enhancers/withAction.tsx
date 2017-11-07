import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import * as shallowCompare from 'react-addons-shallow-compare';
import { IFlowContext } from '../Flow';
import { INode, IGroup, TAnyAction } from '../../flowTypes';
import { getDisplayName } from '../../helpers/utils';
import {
    TGetTypeConfig,
    TGetOperatorConfig,
    IType,
    IOperator,
    IEndpoints
} from '../../services/EditorConfig';
import ComponentMap from '../../services/ComponentMap';
import TitleBar from '../TitleBar';
import { LocalizedObject } from '../../services/Localization';

const shared = require('../shared.scss');
const styles = require('./withAction.scss');

// props passed to the HOC but not threaded through to wrapped component
export interface IWithActionExternalProps {
    node: INode;
    action: TAnyAction;
    context: IFlowContext;
    dragging: boolean;
    hasRouter: boolean;

    first: boolean;

    Localization: LocalizedObject;

    typeConfigList: IType[];
    operatorConfigList: IOperator[];
    getTypeConfig: TGetTypeConfig;
    getOperatorConfig: TGetOperatorConfig;
    endpoints: IEndpoints;

    ComponentMap: ComponentMap;
}

interface IWithActionState {
    editing: boolean;
    confirmRemoval: boolean;
}

type HOCWrapped<P> = React.ComponentClass<P> | React.SFC<P>;

const withAction = () =>
    <TWithActionOriginalProps extends {}>(Component: HOCWrapped<TAnyAction>) => {
        type TResultProps = TWithActionOriginalProps & IWithActionExternalProps;
        const result = class WithAction extends React.Component<TResultProps, IWithActionState> {
            static displayName = getDisplayName('WithAction', Component);

            private clicking = false;

            protected localizedKeys: string[] = [];

            constructor(props: TResultProps) {
                super(props);
                this.state = { editing: false, confirmRemoval: false };
                this.onClick = this.onClick.bind(this);
            }

            getAction(): TAnyAction {
                let action;

                if (this.props.Localization) {
                    action = this.props.Localization.getObject();
                } else {
                    action = this.props.action;
                }

                return action as TAnyAction;
            }

            setEditing(editing: boolean): void {
                this.setState({ editing });
            }

            onClick(event: React.SyntheticEvent<MouseEvent>): void {
                event.preventDefault();
                event.stopPropagation();

                var localizations: LocalizedObject[] = [];
                if (this.props.Localization) {
                    localizations.push(this.props.Localization);
                }

                this.props.context.eventHandler.openEditor({
                    context: this.props.context,
                    node: this.props.node,
                    action: this.props.action,
                    actionsOnly: true,
                    nodeUI: null,
                    localizations: localizations,
                    typeConfigList: this.props.typeConfigList,
                    operatorConfigList: this.props.operatorConfigList,
                    getTypeConfig: this.props.getTypeConfig,
                    getOperatorConfig: this.props.getOperatorConfig,
                    endpoints: this.props.endpoints,
                    ComponentMap: this.props.ComponentMap
                });
            }

            componentDidUpdate(prevProps: IWithActionExternalProps, prevState: IWithActionState): void {
                if (this.props.dragging) {
                    this.clicking = false;
                }
            }

            private onConfirmRemoval(evt: React.SyntheticEvent<MouseEvent>): void {
                evt.stopPropagation();
                this.setState({ confirmRemoval: true });
            }

            private onRemoval(evt: React.SyntheticEvent<MouseEvent>): void {
                evt.stopPropagation();
                this.props.context.eventHandler.onRemoveAction(this.props.action);
            }

            private onMoveUp(evt: React.SyntheticEvent<MouseEvent>): void {
                evt.stopPropagation();
                this.props.context.eventHandler.onMoveActionUp(this.props.action);
            }

            public getType(): string {
                return this.props.action.type;
            }

            render(): JSX.Element {
                let config = this.props.getTypeConfig(this.props.action.type);
                let classes = [styles.action];

                if (this.props.first) {
                    classes = [...classes, styles.first];
                }

                if (this.props.hasRouter) {
                    classes = [...classes, styles.has_router];
                }

                if (this.props.Localization) {
                    classes = [...classes, styles.translating];

                    if (this.props.action.type === 'reply') {
                        this.localizedKeys = ['text'];
                    }

                    if (this.localizedKeys.length === 0) {
                        classes = [...classes, styles.not_localizable];
                    } else {
                        for (let key of this.localizedKeys) {
                            if (!(key in this.props.Localization.localizedKeys)) {
                                classes = [...classes, styles.missing_localization];
                                break;
                            }
                        }
                    }
                }

                const withActionInjectedProps = this.getAction();

                return (
                    <div id={`action-${this.props.action.uuid}`} className={classes.join(' ')}>
                        <div className={styles.overlay} />
                        <div
                            onMouseDown={() => {
                                this.clicking = true;
                            }}
                            onMouseUp={(event: any) => {
                                if (this.clicking) {
                                    this.clicking = false;
                                    this.onClick(event);
                                }
                            }}
                            data-spec="interactive-div">
                            <TitleBar
                                className={shared[this.props.action.type]}
                                title={config.name}
                                onRemoval={this.onRemoval.bind(this)}
                                showRemoval={!this.props.Localization}
                                showMove={!this.props.first && !this.props.Localization}
                            />
                            <div className={styles.body}>
                                <Component {...withActionInjectedProps} />
                            </div>
                        </div>
                    </div>
                );
            }
        };

        return result;
    };

export default withAction;
