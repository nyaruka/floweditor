import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
import { NodeEditorProps } from './NodeModal';
import { FlowContext } from './Flow';
import { Action, SwitchRouter } from '../FlowDefinition';
import { Plumber } from '../services/Plumber';
import { FlowStore } from '../services/FlowStore';
import { Config } from '../services/Config';
import { TitleBar } from './TitleBar';
import { SwitchRouterProps } from "./routers/SwitchRouter";
import { NodeProps } from "./Node";

var shared = require('./shared.scss');
var styles = require('./Action.scss');

export interface ActionProps extends NodeEditorProps {
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
        if (!this.props.dragging) {
            this.props.context.eventHandler.onEditAction(this.props, true);
        }
    }

    getClassName() {
        return this.props.action.type.split('_').join('-');
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
        var events = { onMouseUp: this.onClick.bind(this) }

        return (
            <div id={this.props.action.uuid} className={styles.action}>
                <div {...events}>

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
