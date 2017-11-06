import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import * as shallowCompare from 'react-addons-shallow-compare';
import { IFlowContext } from '../Flow';
import { INode, IAction, IAnyAction } from '../../flowTypes';
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

type HOCWrapped<P, PHoc> = React.ComponentClass<P & PHoc> | React.SFC<P & PHoc>;

export interface IActionProps {
    node: INode;
    action: IAction;
    context: IFlowContext;
    dragging: boolean;
    hasRouter: boolean;
    // are we the first action
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

export type TWithAction = React.ComponentClass<{} & IActionProps>;

function withAction() {
    return function<OriginalProps extends {}>(
        Component: HOCWrapped<OriginalProps, IAnyAction>
    ): React.ComponentClass<OriginalProps & IActionProps> {
        return class WithAction extends React.Component<OriginalProps & IActionProps> {
            static displayName = getDisplayName('WithAction', Component);

            private clicking = false;

            protected localizedKeys: string[] = [];

            constructor(props: OriginalProps & IActionProps) {
                super(props);
                this.state = { editing: false, confirmRemoval: false };
                this.onClick = this.onClick.bind(this);
            }

            getAction(): IAction {
                let action = this.props.action;

                if (this.props.Localization) {
                    action = this.props.Localization.getObject() as IAction;
                }

                return action;
            }

            setEditing(editing: boolean) {
                this.setState({ editing });
            }

            onClick(event: React.SyntheticEvent<MouseEvent>) {
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

            componentDidUpdate(prevProps: IActionProps, prevState: IWithActionState) {
                if (this.props.dragging) {
                    this.clicking = false;
                }
            }

            private onConfirmRemoval(evt: React.SyntheticEvent<MouseEvent>) {
                evt.stopPropagation();
                this.setState({ confirmRemoval: true });
            }

            private onRemoval(evt: React.SyntheticEvent<MouseEvent>) {
                evt.stopPropagation();
                this.props.context.eventHandler.onRemoveAction(this.props.action);
            }

            private onMoveUp(evt: React.SyntheticEvent<MouseEvent>) {
                evt.stopPropagation();
                this.props.context.eventHandler.onMoveActionUp(this.props.action);
            }

            public getType() {
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

                return (
                    <div id={this.props.action.uuid} className={classes.join(' ')}>
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
                                <Component {...this.getAction()} />
                            </div>
                        </div>
                    </div>
                );
            }
        };
    };
}

export default withAction;
