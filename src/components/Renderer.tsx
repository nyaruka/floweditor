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

    renderNode(): JSX.Element { return; }
    abstract renderForm(): JSX.Element;
    abstract validate(ele: any): string;
    abstract submit(form: HTMLFormElement, current: Interfaces.FlowDefinition): Interfaces.FlowDefinition;
}

export default Renderer;