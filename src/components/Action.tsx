import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
import { NodeEditorProps } from './NodeModal';
import { FlowContext } from './Flow';
import { Action } from '../FlowDefinition';
import { Plumber } from '../services/Plumber';
import { FlowStore } from '../services/FlowStore';
import { Config } from '../services/Config';
import { TitleBar } from './TitleBar';

var shared = require('./shared.scss');
var styles = require('./Action.scss');

export interface ActionProps extends NodeEditorProps {
    action: Action;
    context: FlowContext;
    dragging: boolean;
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
        if (this.props.context.eventHandler.onEditNode && !this.props.dragging) {
            this.props.context.eventHandler.onEditNode({
                initial: this.props,
                type: this.props.action.type,
                uuid: this.props.action.uuid,
                context: this.props.context
            });
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

    renderNode(): JSX.Element {
        return null;
    }

    render() {
        let config = Config.get().getTypeConfig(this.props.action.type);
        var events = { onMouseUp: this.onClick.bind(this) }

        return (
            <div id={this.props.action.uuid} className={styles.action}>
                <div {...events}>
                    <TitleBar className={shared[this.getClassName()]} title={config.name} onRemoval={this.onRemoval.bind(this)} />
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
