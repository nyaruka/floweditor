import * as React from 'react';
import {Renderer} from '../Renderer'
import * as Interfaces from '../../interfaces';
var Select2 = require('react-select2-wrapper');

export class RandomRouter extends Renderer {
    renderNode(): JSX.Element {
        return <div>Not implemented</div>
    }

    renderForm(): JSX.Element {
        return <div>Random split editor goes here</div>
    }
    
    submit(context: Interfaces.FlowContext, form: Element): void {
        
    }
}

export default RandomRouter;


