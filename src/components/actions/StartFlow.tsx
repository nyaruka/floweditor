import * as React from 'react';
import { ActionComp, ActionProps } from '../Action';
import { ActionForm } from '../NodeForm';
import { SwitchRouter, Case, Exit, StartFlow } from '../../FlowDefinition';
import { NodeModalProps } from '../NodeModal';
import { TextInputElement } from '../form/TextInputElement';
import { FlowElement } from '../form/FlowElement';

var shared = require('../shared.scss');

export class StartFlowComp extends ActionComp<StartFlow> {
    renderNode(): JSX.Element {
        return <div>{this.getAction().flow_name}</div>
    }
}