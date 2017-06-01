import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
import { ActionProps } from '../interfaces'
import { Plumber } from '../services/Plumber';
import { FlowStore } from '../services/FlowStore';
import { Config } from '../services/Config';
import { TitleBar } from './TitleBar';

var shared = require('./shared.scss');
var styles = require('./Action.scss');

/**
 * Base Action class for the rendered flow
 */
export class ActionComp<P extends ActionProps> extends React.PureComponent<P, {}> {

    public form: HTMLFormElement;

    constructor(props: P) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    setEditing(editing: boolean) {
        this.setState({ editing: editing })
    }

    onClick(event: React.SyntheticEvent<MouseEvent>) {
        if (this.props.context.eventHandler.onEditNode && !this.props.dragging) {
            this.props.context.eventHandler.onEditNode({
                initial: this.props,
                type: this.props.type,
                uuid: this.props.uuid,
                context: this.props.context
            });
        }
    }

    getClassName() {
        return this.props.type.split('_').join('-');
    }

    private onConfirmRemoval(evt: React.SyntheticEvent<MouseEvent>) {
        evt.stopPropagation();
        this.setState({ confirmRemoval: true })
    }

    private onRemoval(evt: React.SyntheticEvent<MouseEvent>) {
        evt.stopPropagation();
        this.props.context.eventHandler.onRemoveAction(this.props);
    }

    renderNode(): JSX.Element {
        return null;
    }

    render() {
        let config = Config.get().getTypeConfig(this.props.type);
        var events = { onMouseUp: this.onClick.bind(this) }

        return (
            <div id={this.props.uuid} className={styles.action}>
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
        return this.props.type;
    }
}

export default ActionComp;
