import * as React from 'react';
import { ActionComp } from "../Action";
import { ActionForm } from "../NodeForm";
import { SaveFlowResult } from "../../FlowDefinition";
import { NodeModalProps } from "../NodeModal";
import { TextInputElement } from "../form/TextInputElement";

var styles = require('./SaveFlowResult.scss');

export class SaveFlowResultComp extends ActionComp<SaveFlowResult> {
    renderNode(): JSX.Element {
        var action = this.getAction();
        if (action.value) {
            return <div>Save {action.value} as <span className="emph">{action.result_name}</span></div>
        } else {
            return <div>Clear value for <span className="emph">{action.result_name}</span></div>
        }
    }
}

export class SaveFlowResultForm extends ActionForm<SaveFlowResult, {}> {

    renderForm() {
        var action = this.getAction();
        var ref = this.ref.bind(this);
        return (
            <div className={styles.form}>

                <TextInputElement className={styles.name} ref={ref} name="Name" showLabel={true} defaultValue={action.result_name} required
                    helpText="The name of the result, used to reference later, for example: @run.results.my_result_name"
                />
                <TextInputElement className={styles.value} ref={ref} name="Value" showLabel={true} defaultValue={action.value} autocomplete
                    helpText="The value to save for this result or empty to clears it. You can use expressions, for example: @(title(input))"
                />
                <TextInputElement className={styles.category} ref={ref} name="Category" placeholder="Optional" showLabel={true} defaultValue={action.category} autocomplete
                    helpText="An optional category for your result. For age, the value might be 17, but the category might be 'Young Adult'"
                />
            </div>
        )
    }

    submit(modal: NodeModalProps) {
        var eles = this.getElements();
        var nameEle = eles[0] as TextInputElement;
        var valueEle = eles[1] as TextInputElement;
        var categoryEle = eles[2] as TextInputElement;

        var newAction: SaveFlowResult = {
            uuid: this.getUUID(),
            type: this.props.config.type,
            result_name: nameEle.state.value,
            value: valueEle.state.value,
            category: categoryEle.state.value
        }

        modal.onUpdateAction(newAction);
    }
}