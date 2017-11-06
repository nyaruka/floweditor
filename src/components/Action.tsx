import * as React from 'react';
import * as axios from 'axios';
import * as UUID from 'uuid';
import * as shallowCompare from 'react-addons-shallow-compare';
import { IFlowContext } from './Flow';
import { INode, IAction } from '../flowTypes';
import {
    TGetTypeConfig,
    TGetOperatorConfig,
    IType,
    IOperator,
    IEndpoints
} from '../services/EditorConfig';
import ComponentMap from '../services/ComponentMap';
import TitleBar from './TitleBar';
import { LocalizedObject } from '../services/Localization';

const shared = require('./shared.scss');
const styles = require('./Action.scss');

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

/**
 * Base Action class for the rendered flow
 */
export class ActionComp<A extends IAction> extends React.PureComponent<IActionProps, {}> {
    public form: HTMLFormElement;
    private clicking = false;

    protected localizedKeys: string[] = [];

    constructor(props: IActionProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    getAction(): A {
        var action = this.props.action;

        if (this.props.Localization) {
            action = this.props.Localization.getObject() as A;
        }

        return action as A;
    }

    setEditing(editing: boolean) {
        this.setState({ editing: editing });
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

    componentDidUpdate(prevProps: IActionProps, prevState: IActionProps) {
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

    /**
     * Overwritten by actions that inherit this class
     */
    renderNode(): JSX.Element {
        return null;
    }

    render() {
        // console.log("rendering ", this.props.action.uuid, this.props.Localization);

        let config = this.props.getTypeConfig(this.props.action.type);
        var classes = [styles.action];

        if (this.props.first) {
            classes.push(styles.first);
        }

        if (this.props.hasRouter) {
            classes.push(styles.has_router);
        }

        if (this.props.Localization) {
            classes.push(styles.translating);

            if (this.localizedKeys.length == 0) {
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
                    }}>
                    <TitleBar
                        className={shared[this.props.action.type]}
                        title={config.name}
                        onRemoval={this.onRemoval.bind(this)}
                        showRemoval={!this.props.Localization}
                        showMove={!this.props.first && !this.props.Localization}
                        onMoveUp={this.onMoveUp.bind(this)}
                    />
                    <div className={styles.body}>{this.renderNode()}</div>
                </div>
            </div>
        );
    }

    getType() {
        return this.props.action.type;
    }
}

export default ActionComp;
