import * as React from 'react';
import * as Interfaces from '../interfaces';
import Plumber from '../services/Plumber';
var Select2 = require('react-select2-wrapper');

export abstract class Renderer {
    
    props: Interfaces.NodeEditorProps;

    constructor(props: Interfaces.NodeEditorProps) {
        this.props = props;
    }

    public getClassName() {
        return this.props.type.split('_').join('-');
    }

    public updateAction(props: Interfaces.NodeEditorProps) {
        // add in our details for new nodes from drags or newly created actions
        props = {...props, draggedFrom: this.props.draggedFrom, addToNode: this.props.addToNode, newPosition: this.props.newPosition}
        this.props.mutator.updateAction(props);
    }

    renderNode(): JSX.Element { return; }
    abstract renderForm(): JSX.Element;
    abstract validate(ele: any): string;
    abstract submit(form: HTMLFormElement): void;
}

export default Renderer;