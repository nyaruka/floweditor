import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
import { FlowContext } from './Flow';
import { Node, Action, SwitchRouter } from '../FlowDefinition';
import { Plumber } from '../services/Plumber';
import { FlowStore } from '../services/FlowStore';
import { Config } from '../services/Config';
import { TitleBar } from './TitleBar';
import { NodeProps } from "./Node";

var shared = require('./shared.scss');
var styles = require('./Action.scss');

export interface ActionProps {
    node: Node;
    action: Action;
    context: FlowContext;
    dragging: boolean;

    // are we the first action in the list
    first: boolean;
}

/**
 * Base Action class for the rendered flow
 */
export class ActionComp<A extends Action> extends React.PureComponent<ActionProps, {}> {

    public form: HTMLFormElement;
    private clicking = false;

    constructor(props: ActionProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    getAction(): A {
        return this.props.action as A;
    }

    setEditing(editing: boolean) {
        this.setState({ editing: editing })
    }

    onClick(event: React.SyntheticEvent<MouseEvent>) {
        event.preventDefault();
        event.stopPropagation();

        this.props.context.eventHandler.openEditor({
            context: this.props.context,
            node: this.props.node,
            action: this.props.action,
            actionsOnly: true,
            nodeUI: null
        });
    }

    componentDidUpdate(prevProps: ActionProps, prevState: ActionProps) {
        if (this.props.dragging) {
            this.clicking = false;
        }
    }

    private onConfirmRemoval(evt: React.SyntheticEvent<MouseEvent>) {
        evt.stopPropagation();
        this.setState({ confirmRemoval: true })
    }

    private onRemoval(evt: React.SyntheticEvent<MouseEvent>) {
        evt.stopPropagation();
        this.props.context.eventHandler.onRemoveAction(this.props.action);
    }

    private onMoveUp(evt: React.SyntheticEvent<MouseEvent>) {
        evt.stopPropagation();
        this.props.context.eventHandler.onMoveActionUp(this.props.action);
    }

    renderNode(): JSX.Element {
        return null;
    }



    render() {
        let config = Config.get().getTypeConfig(this.props.action.type);
        return (
            <div id={this.props.action.uuid} className={styles.action}>
                <div
                    onMouseDown={() => { this.clicking = true }}
                    onMouseUp={(event: any) => { if (this.clicking) { this.onClick(event) } }}
                >
                    <TitleBar
                        className={shared[this.props.action.type]}
                        title={config.name}
                        onRemoval={this.onRemoval.bind(this)}
                        showMove={!this.props.first}
                        onMoveUp={this.onMoveUp.bind(this)}
                    />
                    <div className={styles.body}>
                        {this.renderNode()}
                    </div>
                </div>
            </div>
        )
    }

    getType() {
        return this.props.action.type;
    }
}

export default ActionComp;
