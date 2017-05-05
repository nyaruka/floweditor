import * as React from 'react';
import * as Interfaces from '../../interfaces';
import Renderer from '../Renderer'
import FlowStore from '../../services/FlowStore';
import {toBoolMap} from '../../utils';
import {Select2Search} from '../Select2Search';
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

export class SaveToContact extends Renderer {
    props: Interfaces.SaveToContactProps;
    fieldValue: string;
    fieldSelect: Select2Search;
    
    constructor(props: Interfaces.SaveToContactProps) {
        super(props);
    }

    renderNode(): JSX.Element {
        return <div>Updates <span className="emph">{this.props.name}</span></div>
    }

    addExtraResults(results: Interfaces.SearchResult[], term: string) {
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
        return (
            <div>
                <div className="form-group">
                    <div className="form-label">Field Name</div>
                    <Select2Search 
                        ref={(ele: any) => {this.fieldSelect = ele}} 
                        url={this.props.mutator.getContactFieldURL()} 
                        localSearchOptions={this.props.mutator.getContactFields()}
                        addExtraResults={this.addExtraResults.bind(this)}
                        initial={{
                            id: this.props.field,
                            name: this.props.name, 
                            type: this.props.type,                    
                        }}
                    />
                    <div className="form-help">Select an existing field to update or type name to create a new one</div>
                </div>
                <div className="form-group">
                    <div className="form-label">Value</div>                    
                    <input name="url" className="url" defaultValue={this.props.value}/>
                    <div className="form-help">The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json.</div>
                </div>
            </div>
        )
    }

    validate(control: any): string {
        return null;
    }

    submit(form: HTMLFormElement) {
        let selections = this.fieldSelect.getSelection();
        if (selections.length > 0) {
            let selection = selections[0];
            var input: HTMLInputElement = $(form).find('input')[0] as HTMLInputElement;

            // update our flow   
            this.props.mutator.updateAction({
                uuid: this.props.uuid, 
                type: "save_to_contact", 
                name: selection.name, 
                field: selection.id, 
                value: input.value
            } as Interfaces.SaveToContactProps);

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