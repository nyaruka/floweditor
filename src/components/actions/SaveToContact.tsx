import * as React from 'react';
import {Renderer} from '../Renderer'
import * as Interfaces from '../../interfaces';
var Select2 = require('react-select2-wrapper');

export class SaveToContact extends Renderer {

    props: Interfaces.SaveToContactProps;

    renderNode(): JSX.Element {
        return <div>Updates <span className="emph">{this.props.name}</span></div>
    }

    renderForm(): JSX.Element {
        return <div>Not implemented</div>
    }

    submit(): void {
        
    }
}


export default SaveToContact;