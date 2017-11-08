import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import { INode, IGroup, TAnyAction } from '../../flowTypes';
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
export interface IActionProps {
    node: INode;
    action: TAnyAction;
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

    openEditor: Function;
    onRemoveAction: Function;
    onMoveActionUp: Function;
    onUpdateLocalizations: Function;
    onUpdateAction: Function;
    onUpdateRouter: Function;
}

interface IActionState {
    editing: boolean;
    confirmRemoval: boolean;
}

class Action extends React.Component<IActionProps, IActionState> {
    private clicking = false;

    protected localizedKeys: string[] = [];

    constructor(props: IActionProps) {
        super(props);
        this.state = { editing: false, confirmRemoval: false };
        this.onClick = this.onClick.bind(this);
    }

    setEditing(editing: boolean): void {
        this.setState({ editing });
    }

    onClick(event: React.SyntheticEvent<MouseEvent>): void {
        event.preventDefault();
        event.stopPropagation();

        let localizations: LocalizedObject[] = [];

        if (this.props.Localization) {
            localizations = [...localizations, this.props.Localization];
        }

        this.props.openEditor({
            onUpdateLocalizations: this.props.onUpdateLocalizations,
            onUpdateAction: this.props.onUpdateAction,
            onUpdateRouter: this.props.onUpdateRouter,
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

    componentDidUpdate(prevProps: IActionProps, prevState: IActionState): void {
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
        this.props.onRemoveAction(this.props.action);
    }

    private onMoveUp(evt: React.SyntheticEvent<MouseEvent>): void {
        evt.stopPropagation();
        this.props.onMoveActionUp(this.props.action);
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
                this.localizedKeys = [...this.localizedKeys, 'text'];
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
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

export default Action;
