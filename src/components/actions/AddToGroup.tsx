import * as React from 'react';
import {Renderer} from '../Renderer'
import * as Interfaces from '../../interfaces';
var Select2 = require('react-select2-wrapper');

export class AddToGroup extends Renderer {

    props: Interfaces.AddToGroupProps;

    renderNode(): JSX.Element {
        return <div>{this.props.name}</div>
    }

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }
    
    validate(control: any): string {
        return null;
    }

    submit(form: HTMLFormElement) {}

}

export default AddToGroup;