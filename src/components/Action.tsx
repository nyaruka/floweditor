import * as React from "react";
import * as axios from "axios";
import * as UUID from 'uuid';
import * as shallowCompare from 'react-addons-shallow-compare';

import { FlowContext } from './Flow';
import { Node, Action, SwitchRouter } from '../FlowDefinition';
import { Plumber } from '../services/Plumber';
import { FlowStore } from '../services/FlowStore';
import { Config } from '../services/Config';
import { TitleBar } from './TitleBar';
import { NodeProps } from "./Node";
import { LocalizedObject } from "../Localization";

var shared = require('./shared.scss');
var styles = require('./Action.scss');

export interface ActionProps {
    node: Node;
    action: Action;
    context: FlowContext;
    dragging: boolean;
    localization: LocalizedObject;

    hasRouter: boolean;

    // are we the first action
    first: boolean;
}

/**
 * Base Action class for the rendered flow
 */
export class ActionComp<A extends Action> extends React.PureComponent<ActionProps, {}> {

    public form: HTMLFormElement;
    private clicking = false;

    protected localizedKeys: string[] = [];

    constructor(props: ActionProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    getAction(): A {
        var action = this.props.action;

        if (this.props.localization) {
            action = this.props.localization.getObject() as A;
        }
        return action as A;
    }

    setEditing(editing: boolean) {
        this.setState({ editing: editing })
    }

    onClick(event: React.SyntheticEvent<MouseEvent>) {
        event.preventDefault();
        event.stopPropagation();

        var localizations: LocalizedObject[] = [];
        if (this.props.localization) {
            localizations.push(this.props.localization);
        }

        this.props.context.eventHandler.openEditor({
            context: this.props.context,
            node: this.props.node,
            action: this.props.action,
            actionsOnly: true,
            nodeUI: null,
            localizations: localizations
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

    /**
     * Overwritten by actions that inherit this class
     */
    renderNode(): JSX.Element {
        return null;
    }

    render() {

        // console.log("rendering ", this.props.action.uuid, this.props.localization);

        let config = Config.get().getTypeConfig(this.props.action.type);
        var classes = [styles.action];

        if (this.props.first) {
            classes.push(styles.first);
        }

        if (this.props.hasRouter) {
            classes.push(styles.has_router);
        }

        if (this.props.localization) {
            classes.push(styles.translating);

            if (this.localizedKeys.length == 0) {
                classes.push(styles.not_localizable);
            } else {
                for (let key of this.localizedKeys) {
                    if (!(key in this.props.localization.localizedKeys)) {
                        classes.push(styles.missing_localization);
                        break;
                    }
                }
            }
        }

        return (
            <div id={this.props.action.uuid} className={classes.join(" ")}>
                <div className={styles.overlay} />
                <div
                    onMouseDown={() => { this.clicking = true }}
                    onMouseUp={(event: any) => { if (this.clicking) { this.clicking = false; this.onClick(event) } }}>
                    <TitleBar
                        className={shared[this.props.action.type]}
                        title={config.name}
                        onRemoval={this.onRemoval.bind(this)}
                        showRemoval={!this.props.localization}
                        showMove={!this.props.first && !this.props.localization}
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
