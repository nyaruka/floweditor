import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import { Node, Group, AnyAction } from '../../flowTypes';
import {
    GetTypeConfig,
    GetOperatorConfig,
    Type,
    Operator,
    Endpoints
} from '../../services/EditorConfig';
import ComponentMap from '../../services/ComponentMap';
import TitleBarComp from '../TitleBar';
import { LocalizedObject } from '../../services/Localization';

const shared = require('../shared.scss');
const styles = require('./Action.scss');

// props passed to the HOC but not threaded through to wrapped component
export interface ActionProps {
    node: Node;
    action: AnyAction;
    dragging: boolean;
    hasRouter: boolean;

    first: boolean;

    Localization: LocalizedObject;

    typeConfigList: Type[];
    operatorConfigList: Operator[];
    getTypeConfig: GetTypeConfig;
    getOperatorConfig: GetOperatorConfig;
    endpoints: Endpoints;

    ComponentMap: ComponentMap;

    openEditor: Function;
    onRemoveAction: Function;
    onMoveActionUp: Function;
    onUpdateLocalizations: Function;
    onUpdateAction: Function;
    onUpdateRouter: Function;

    children?(actionDivProps: AnyAction): JSX.Element;
}

interface ActionState {
    editing: boolean;
    confirmRemoval: boolean;
}

class Action extends React.Component<ActionProps, ActionState> {
    private clicking = false;

    protected localizedKeys: string[] = [];

    constructor(props: ActionProps) {
        super(props);
        this.state = { editing: false, confirmRemoval: false };

        this.onClick = this.onClick.bind(this);
        this.onRemoval = this.onRemoval.bind(this);
        this.onMoveUp = this.onMoveUp.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
    }

    public setEditing(editing: boolean): void {
        this.setState({ editing });
    }

    public onClick(event: React.MouseEvent<HTMLDivElement>): void {
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

    public componentDidUpdate(prevProps: ActionProps, prevState: ActionState): void {
        if (this.props.dragging) {
            this.clicking = false;
        }
    }

    private onRemoval(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();
        this.props.onRemoveAction(this.props.action);
    }

    private onMoveUp(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();
        this.props.onMoveActionUp(this.props.action);
    }

    public getAction(): AnyAction {
        let actionDivProps;

        if (this.props.Localization) {
            actionDivProps = this.props.Localization.getObject() as AnyAction;
        } else {
            actionDivProps = this.props.action;
        }

        return actionDivProps;
    }

    private onMouseUp(evt: React.MouseEvent<HTMLDivElement>): void {
        if (this.clicking) {
            this.clicking = false;
            this.onClick(evt);
        }
    }

    private onMouseDown(evt: React.MouseEvent<HTMLDivElement>): void {
        this.clicking = true;
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
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    data-spec="interactive-div">
                    <TitleBarComp
                        className={shared[this.props.action.type]}
                        title={config.name}
                        onRemoval={this.onRemoval}
                        showRemoval={!this.props.Localization}
                        showMove={!this.props.first && !this.props.Localization}
                        onMoveUp={this.onMoveUp}
                    />
                    <div className={styles.body}>
                        {this.props.children(this.getAction())}
                    </div>
                </div>
            </div>
        );
    }
}

export default Action;
