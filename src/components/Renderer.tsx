import * as React from 'react';
import * as Interfaces from '../interfaces';
import Plumber from '../services/Plumber';
var Select2 = require('react-select2-wrapper');

export abstract class Renderer {
    
    props: Interfaces.NodeEditorProps;
    context: Interfaces.FlowContext
    constructor(props: Interfaces.NodeEditorProps, context: Interfaces.FlowContext) {
        this.props = props;
        this.context = context;
    }

    public getClassName() {
        return this.props.type.split('_').join('-');
    }

    renderNode(): JSX.Element { return; }
    abstract renderForm(): JSX.Element;
    abstract submit(form: Element): void;
}

export default Renderer;