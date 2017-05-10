import * as React from "react";
import {NodeEditorProps, NodeEditorState} from '../interfaces'
import {Plumber} from '../services/Plumber';
import {FlowStore} from '../services/FlowStore';
import {Config} from '../services/Config';
import {NodeModal} from './NodeModal';
import {TitleBar} from './TitleBar';

let PropTypes = require("prop-types");
let UUID  = require("uuid");

/**
 * Base Action class for the rendered flow
 */
export abstract class NodeFormComp<P extends NodeEditorProps, S extends NodeEditorState> extends React.PureComponent<P, S> {

    abstract validate(ele: any): string;
    abstract submit(form: HTMLFormElement): void;
    abstract renderForm(): JSX.Element;

    public updateAction(props: NodeEditorProps) {
        // add in our details for new nodes from drags or newly created actions
        props = {...props, draggedFrom: this.props.draggedFrom, addToNode: this.props.addToNode, newPosition: this.props.newPosition}
        this.props.mutator.updateAction(props);
    }

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

export default NodeFormComp;
