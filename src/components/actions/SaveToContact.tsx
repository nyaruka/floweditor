import * as React from 'react';
import { FlowStore } from '../../services/FlowStore';
import { toBoolMap } from '../../utils';
import { SelectSearch } from '../SelectSearch';
import { SearchResult } from '../ComponentMap';
import { SaveToContact } from '../../FlowDefinition';
import { NodeModalProps } from '../NodeModal';
import { ActionForm } from '../NodeForm';
import { ActionComp } from '../Action';
import { FieldElement } from '../form/FieldElement';
import { TextInputElement } from '../form/TextInputElement';

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
        return <div>Updates <span className="emph">{this.getAction().field_name}</span></div>
    }
}

export class SaveToContactForm extends ActionForm<SaveToContact, {}> {

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

    renderForm(): JSX.Element {
        var initial: SearchResult = null;
        var action = this.getAction();

        if (action && action.type == "save_to_contact") {
            initial = {
                id: action.field_uuid,
                name: action.field_name,
                type: action.type,
            };
        }

        var ref = this.ref.bind(this);
        return (
            <div>
                <FieldElement
                    ref={ref}
                    name="Field" showLabel={true}
                    endpoint={this.props.context.endpoints.fields}
                    getLocalFields={this.props.context.getContactFields}
                    helpText={"Select an existing field to update or type name to create a new one"}
                    initial={initial} add required
                />

                <TextInputElement ref={ref} name="Value" showLabel={true} defaultValue={action.value}
                    helpText="The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json."
                    autocomplete
                />
            </div>
        )
    }

    submit(modal: NodeModalProps) {

        var elements = this.getElements();
        var fieldEle = elements[0];
        var valueEle = elements[1];

        var field = fieldEle.state.field;

        var newAction: SaveToContact = {
            uuid: this.getUUID(),
            type: this.props.config.type,
            field_name: field.name,
            field_uuid: field.id,
            value: valueEle.state.value
        }

        modal.onUpdateAction(newAction);

        if (field.extraResult) {
            this.props.context.eventHandler.onAddContactField({
                id: field.id,
                name: field.name,
                type: field.type
            });
        }
    }
}

export default SaveToContact;