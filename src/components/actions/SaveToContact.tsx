import * as React from 'react';
import {FlowStore} from '../../services/FlowStore';
import {toBoolMap} from '../../utils';
import {SelectSearch} from '../SelectSearch';
import {SaveToContactProps, NodeEditorState, SearchResult} from '../../interfaces';
import {NodeModalProps} from '../NodeModal';
import {NodeForm} from '../NodeForm';
import {Action} from '../Action';

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

export class SaveToContact extends Action<SaveToContactProps> {
    renderNode() {
        return <div>Updates <span className="emph">{this.props.name}</span></div>
    }
}

export class SaveToContactForm extends NodeForm<SaveToContactProps, NodeEditorState> {

    fieldValue: string;
    fieldSelect: SelectSearch;

    isValidNewOption(option: {label: string}): boolean {
        if (!option || !option.label) { return false; }
        let lowered = option.label.toLowerCase();
        return lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) && !reserved[lowered];
    }

    createNewOption(arg: { label: string}): SearchResult {
        var newOption: SearchResult = {
            id: UUID.v4(),
            name: arg.label,
            type: "field",
            extraResult: true
        } as SearchResult;

        return newOption;
    }

    renderForm(): JSX.Element {
        var initial = []
        if (this.props.type == "save_to_contact") {
            initial.push({
                id: this.props.field,
                name: this.props.name, 
                type: this.props.type,                    
            });
        }

        return (
            <div>
                <div className="form-group">
                    <div className="form-label">Field Name</div>
                    <div className="form-group">
                        <SelectSearch 
                            ref={(ele: any) => {this.fieldSelect = ele}} 
                            className="form-control"
                            url={this.props.context.endpoints.fields}
                            localSearchOptions={this.props.context.getContactFields()}
                            createNewOption={this.createNewOption.bind(this)}
                            isValidNewOption={this.isValidNewOption.bind(this)}
                            clearable={false}
                            createPrompt="New field: "
                            name="field"
                            initial={initial}
                        />
                        <div className="error"></div>
                    </div>
                    <div className="form-help">Select an existing field to update or type name to create a new one</div>
                </div>
                <div className="form-group">
                    <div className="form-label">Value</div>                    
                    <input name="value" className="value spacey" defaultValue={this.props.value}/>
                    <div className="form-help">The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json.</div>
                </div>
            </div>
        )
    }

    validate(control: any): string {
        
        // TODO: make validation work for react-select
        if (control.name == "field") {
            if (!this.fieldSelect.state.selection) {
                // console.log("field required");
                return "A contact field is required";
            }
        }

        return null;
    }

    submit(form: HTMLFormElement, modal: NodeModalProps) {
        var selection= this.fieldSelect.state.selection;
        var field = null;
        if (selection && selection.length > 0) {
            field = selection[0]
        }

        var input: HTMLInputElement = $(form).find('.value')[0] as HTMLInputElement;

        if (field) {
            modal.onUpdateAction({
                uuid: this.props.uuid, 
                type: "save_to_contact", 
                name: field.name, 
                field: field.id, 
                value: input.value
            } as SaveToContactProps);

            if (field.extraResult) {
                this.props.context.eventHandler.onAddContactField({
                    id: field.id,
                    name: field.name,
                    type: field.type
                });
            }
        }
    }
}

export default SaveToContact;