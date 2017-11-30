import * as React from 'react';
import { Node, Group, AnyAction } from '../../flowTypes';
import { Endpoints } from '../../flowTypes';
import ComponentMap from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import TitleBarComp from '../TitleBar';
import {
    typeConfigListPT,
    operatorConfigListPT,
    getTypeConfigPT,
    getOperatorConfigPT,
    endpointsPT
} from '../../providers/propTypes';
import { ConfigProviderContext } from '../../providers/ConfigProvider';

const shared = require('../shared.scss');
const styles = require('./Action.scss');

export interface ActionProps {
    node: Node;
    action: AnyAction;
    dragging: boolean;
    hasRouter: boolean;

    first: boolean;

    Localization: LocalizedObject;

    ComponentMap: ComponentMap;

    openEditor: Function;
    onRemoveAction: Function;
    onMoveActionUp: Function;
    onUpdateLocalizations: Function;
    onUpdateAction: Function;
    onUpdateRouter: Function;

    children?(action: AnyAction): JSX.Element;
}

interface ActionState {
    editing: boolean;
    confirmRemoval: boolean;
}

export default class Action extends React.Component<ActionProps, ActionState> {
    protected localizedKeys: string[] = [];
    private clicking = false;

    public static contextTypes = {
        typeConfigList: typeConfigListPT,
        operatorConfigList: operatorConfigListPT,
        getTypeConfig: getTypeConfigPT,
        getOperatorConfig: getOperatorConfigPT,
        endpoints: endpointsPT
    };

    constructor(props: ActionProps, context: ConfigProviderContext) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onRemoval = this.onRemoval.bind(this);
        this.onMoveUp = this.onMoveUp.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
    }

    public onClick(event: React.MouseEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();

        const localizations: LocalizedObject[] = [];

        if (this.props.Localization) {
            localizations.push(this.props.Localization);
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
            typeConfigList: this.context.typeConfigList,
            operatorConfigList: this.context.operatorConfigList,
            getTypeConfig: this.context.getTypeConfig,
            getOperatorConfig: this.context.getOperatorConfig,
            endpoints: this.context.endpoints,
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
        let config = this.context.getTypeConfig(this.props.action.type);
        const classes = [styles.action];

        if (this.props.first) {
            classes.push(styles.first);
        }

        if (this.props.hasRouter) {
            classes.push(styles.has_router);
        }

        if (this.props.Localization) {
            classes.push(styles.translating);

            if (this.props.action.type === 'reply') {
                this.localizedKeys.push('text');
            }

            if (this.localizedKeys.length === 0) {
                classes.push(styles.not_localizable);
            } else {
                for (let key of this.localizedKeys) {
                    if (!(key in this.props.Localization.localizedKeys)) {
                        classes.push(styles.missing_localization);
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
                    <div className={styles.body}>{this.props.children(this.getAction())}</div>
                </div>
            </div>
        );
    }
}
