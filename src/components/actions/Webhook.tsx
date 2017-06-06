import * as React from 'react';
import { ActionComp, ActionProps } from '../Action';
import { ActionForm } from '../NodeForm';
import { Webhook } from '../../FlowDefinition';
import { NodeModalProps } from '../NodeModal';
import { SelectElement } from '../form/SelectElement';
import { TextInputElement } from '../form/TextInputElement';

// var styles = require('./Webhook.scss');
var shared = require('../shared.scss');

export interface WebhookState {
    method: string;
}

export class WebhookComp extends ActionComp<Webhook> {
    renderNode(): JSX.Element {
        return <div>{this.getAction().url}</div>
    }
}

export class WebhookForm extends ActionForm<Webhook, WebhookState> {

    private methodOptions = [{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }];

    constructor(props: ActionProps) {
        super(props);

        var method = this.getAction().method;
        if (!method) {
            method = "GET";
        }

        this.state = {
            method: method
        }
    }

    onChangeMethod(value: any) {
        this.setState({ method: value.value });
    }

    renderForm(): JSX.Element {

        var action = this.getAction();
        var method = action.method;
        if (!method) {
            method = "GET";
        }

        var ref = this.ref.bind(this);

        return (
            <div>

            </div>
        )
    }

    submit(modal: NodeModalProps) {

        var methodEle = this.getElements()[0] as SelectElement;
        var urlEle = this.getElements()[1] as TextInputElement;
        var newAction: Webhook = {
            uuid: this.getUUID(),
            type: this.props.config.type,
            url: urlEle.state.value,
            method: methodEle.state.value
        }

        modal.onUpdateAction(newAction);
    }
}