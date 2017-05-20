import * as React from 'react';
import {FlowStore} from '../../services/FlowStore';
import {toBoolMap} from '../../utils';
import {Select2Search} from '../Select2Search';
import {SaveToContactProps, NodeEditorState, SearchResult} from '../../interfaces';
import {NodeFormComp} from '../NodeForm';
import {Action} from '../Action';

var Select2 = require('react-select2-wrapper');
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

export class SaveToContactForm extends NodeFormComp<SaveToContactProps, NodeEditorState> {

    fieldValue: string;
    fieldSelect: Select2Search;

    addExtraResults(results: SearchResult[], term: string) {
        if (term) {
            term = term.trim();
            let lowered = term.toLowerCase();
            if (lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) && !reserved[lowered]) {
                var exactMatch = false;                
                for (let result of results) {
                    if (result.name.toLowerCase() == term.toLowerCase()) {
                        exactMatch = true;
                        break;
                    }
                }

                if (!exactMatch) {
                    results.push({
                        id: UUID.v4(),
                        name: term,
                        type: "field",
                        prefix: "Create field:",
                        extraResult: true
                    });
                }
            }
        }
    }

    renderForm(): JSX.Element {
        var initial = null
        if (this.props.type == "save_to_contact") {
            initial = {
                id: this.props.field,
                name: this.props.name, 
                type: this.props.type,                    
            }
        }

        // console.log("SaveToContact.render", initial.name, initial.id);

        return (
            <div>
                <div className="form-group">
                    <div className="form-label">Field Name</div>
                    <div className="form-group">
                        <Select2Search 
                            key={UUID.v4()}
                            className="form-control"
                            ref={(ele: any) => {this.fieldSelect = ele}} 
                            name="field"
                            url={this.props.mutator.getContactFieldURL()} 
                            localSearchOptions={this.props.mutator.getContactFields()}
                            addExtraResults={this.addExtraResults.bind(this)}
                            initial={initial}
                        />
                        <div className="error"></div>
                    </div>
                    <div className="form-help">Select an existing field to update or type name to create a new one</div>
                </div>
                <div className="form-group">
                    <div className="form-label">Value</div>                    
                    <input name="value" className="value" defaultValue={this.props.value}/>
                    <div className="form-help">The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json.</div>
                </div>
            </div>
        )
    }

    validate(control: any): string {
        if (control.name == "field") {
            let selections = this.fieldSelect.getSelection();
            if (selections.length == 0){
                return "A contact field is required";
            }
            
        }
        return null;
    }

    submit(form: HTMLFormElement) {
        let selections = this.fieldSelect.getSelection();
        if (selections.length > 0) {
            let selection = selections[0];
            var input: HTMLInputElement = $(form).find('input')[0] as HTMLInputElement;

            // update our flow   
            this.updateAction({
                uuid: this.props.uuid, 
                type: "save_to_contact", 
                name: selection.name, 
                field: selection.id, 
                value: input.value
            } as SaveToContactProps);

            // if this was a newly created field, add it to our main list
            if (selection.extraResult) {
                this.props.mutator.addContactField({
                    id: selection.id,
                    name: selection.name,
                    type: selection.type
                })
            }
        }
    }
}

export default SaveToContact;