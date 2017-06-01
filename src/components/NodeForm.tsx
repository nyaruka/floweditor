import * as React from "react";
import * as UUID from 'uuid';
import { NodeEditorProps, NodeEditorState } from '../interfaces'
import { DragPoint } from './Node';
import { Plumber } from '../services/Plumber';
import { FlowStore } from '../services/FlowStore';
import { Config } from '../services/Config';
import { NodeModal, NodeModalProps } from './NodeModal';
import { TitleBar } from './TitleBar';
import { FormWidget } from './form/FormWidget';

/**
 * Base Action class for the rendered flow
 */
export abstract class NodeForm<P extends NodeEditorProps, S extends NodeEditorState> extends React.PureComponent<P, S> {
    // abstract validate(ele: any): string;
    abstract submit(modalProps: NodeModalProps): void;
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
        return (
            <div>
                {this.renderForm()}
            </div>
        )
    }

    getType() {
        return this.props.type;
    }
}

export default NodeForm;
