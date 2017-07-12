import * as React from 'react';
import { FlowStore } from '../../services/FlowStore';
import { toBoolMap } from '../../utils';
import { SelectSearch } from '../SelectSearch';
import { ComponentMap, SearchResult } from '../ComponentMap';
import { SaveToContact, UpdateContact } from '../../FlowDefinition';
import { ActionComp } from '../Action';
import { FieldElement } from '../form/FieldElement';
import { TextInputElement } from '../form/TextInputElement';
import { NodeActionForm, Widget } from "../NodeEditor";
import { Config } from "../../services/Config";


var UUID = require('uuid');

// TODO: these should come from an external source
var reserved = toBoolMap([
    "language",
    "facebook",
    "telegram",
    "email",
    "mailto",
    "name",
    "first name",
    "phone",
    "groups",
    "uuid",
    "created by",
    "modified by",
    "org",
    "is",
    "has",
    "tel"
]);

export class SaveToContactComp extends ActionComp<SaveToContact> {
    renderNode() {
        var action = this.getAction();
        if (action.value) {
            return <div>Update <span className="emph">{action.field_name}</span> to {this.getAction().value}</div >
        } else {
            return <div>Clear value for <span className="emph">{action.field_name}</span></div>
        }
    }
}

export class SaveToContactForm extends NodeActionForm<SaveToContact> {

    fieldValue: string;
    fieldSelect: SelectSearch;

    isValidNewOption(option: { label: string }): boolean {
        if (!option || !option.label) { return false; }
        let lowered = option.label.toLowerCase();
        return lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) && !reserved[lowered];
    }

    createNewOption(arg: { label: string }): SearchResult {
        var newOption: SearchResult = {
            id: UUID.v4(),
            name: arg.label,
            type: "field",
            extraResult: true
        } as SearchResult;

        return newOption;
    }

    renderForm(ref: any): JSX.Element {
        var initial: SearchResult = null;
        var action = this.getInitial();

        if (action) {
            if (action.type == "save_contact_field") {
                initial = {
                    id: action.field_uuid,
                    name: action.field_name,
                    type: "field",
                };
            } else if (action.type == "update_contact") {
                initial = {
                    id: action.field_name.toLowerCase(),
                    name: action.field_name,
                    type: "update_contact"
                };
            }
        }

        return (
            <div>
                <FieldElement
                    ref={ref}
                    name="Field" showLabel={true}
                    endpoint={Config.get().endpoints.fields}
                    localFields={ComponentMap.get().getContactFields()}
                    helpText={"Select an existing field to update or type any name to create a new one"}
                    initial={initial} add required
                />

                <TextInputElement ref={ref} name="Value" showLabel={true} value={action.value}
                    helpText="The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json."
                    autocomplete
                />

            </div>
        )
    }

    onValid(widgets: { [name: string]: Widget }) {

        var fieldEle = widgets["Field"] as FieldElement;
        var valueEle = widgets["Value"] as TextInputElement;

        var field = fieldEle.state.field;

        var newAction = null;
        if (field.type == "field") {
            newAction = {
                uuid: this.getActionUUID(),
                type: "save_contact_field",
                field_name: field.name,
                field_uuid: field.id,
                value: valueEle.state.value
            } as SaveToContact
        }

        // updating contact properties are different action
        else if (field.type == "update_contact") {
            newAction = {
                uuid: this.getActionUUID(),
                type: "update_contact",
                field_name: field.id,
                value: valueEle.state.value
            } as UpdateContact
        }
        this.props.updateAction(newAction);
    }
}

export default SaveToContact;