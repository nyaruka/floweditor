import * as React from "react";
import * as UUID from 'uuid';
import { DragPoint } from './Node';
import { Plumber } from '../services/Plumber';
import { FlowStore } from '../services/FlowStore';
import { Config } from '../services/Config';
import { NodeEditorProps, NodeModal, NodeModalProps } from './NodeModal';
import { TitleBar } from './TitleBar';
import { FormWidget } from './form/FormWidget';
import { Action } from '../FlowDefinition';
import { ActionProps } from './Action';


/**
 * Base Action class for the rendered flow
 */
export abstract class NodeForm<P extends NodeEditorProps, S> extends React.PureComponent<P, S> {

    // abstract validate(ele: any): string;
    abstract submit(modal: NodeModal): void;
    abstract renderForm(): JSX.Element;

    public elements: any[] = [];

    public getElements() {
        return this.elements;
    }

    ref(widget: any) {
        if (widget) {
            if (this.elements) {
                this.elements.push(widget);
            }
        }
    }

    render() {
        this.elements = [];
        return (
            <div>
                {this.renderForm()}
            </div>
        )
    }
}


export abstract class ActionForm<A extends Action, S> extends NodeForm<ActionProps, S> {
    private uuid: string;

    getUUID() {
        if (this.props.action) {
            return this.props.action.uuid;
        }

        if (this.uuid == null) {
            this.uuid = UUID.v4();
        }
        return this.uuid;
    }

    getAction(): A {
        if (this.props.action) {
            return this.props.action as A;
        }
        return {} as A;
    }

}

export default NodeForm;
