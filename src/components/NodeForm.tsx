import * as React from "react";
import * as UUID from 'uuid';
import {NodeEditorProps, NodeEditorState, LocationProps, DragPoint} from '../interfaces'
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {Config} from '../services/Config';
import {NodeModal, NodeModalProps} from './NodeModal';
import {TitleBar} from './TitleBar';

/**
 * Base Action class for the rendered flow
 */
export abstract class NodeForm<P extends NodeEditorProps, S extends NodeEditorState> extends React.PureComponent<P, S> {

    abstract validate(ele: any): string;
    abstract submit(form: HTMLFormElement, modalProps: NodeModalProps): void;
    abstract renderForm(): JSX.Element;

    render() {
        return(
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
