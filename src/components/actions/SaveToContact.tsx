import * as React from 'react';
import * as Interfaces from '../../interfaces';
import Renderer from '../Renderer'
import {FlowStore} from '../../services/FlowStore';
import {Select2Search} from '../Select2Search';
var Select2 = require('react-select2-wrapper');


export class SaveToContact extends Renderer {

    props: Interfaces.SaveToContactProps;
    fieldValue: string;
    fieldSelect: Select2Search;

    constructor(props: Interfaces.WebhookProps, context: Interfaces.FlowContext) {
        super(props, context);
    }

    renderNode(): JSX.Element {
        return <div>Updates <span className="emph">{this.props.name}</span></div>
    }

    renderForm(): JSX.Element {
        return (
            <div>
                <div className="form-group">
                    <div className="form-label">Field Name</div>
                    <Select2Search 
                        ref={(ele: any) => {this.fieldSelect = ele}} 
                        url={this.context.flow.props.fieldsURL} 
                        additionalOptions={FlowStore.get().getContactFields()}
                        addSearchOption="field"
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

    submit(form: Element): void {
        let selections = this.fieldSelect.getSelection();
        if (selections.length > 0) {
            let selection = selections[0];
            var input: HTMLInputElement = $(form).find('input')[0] as HTMLInputElement;

            // update our flow            
            this.context.flow.updateAction(this.props.uuid, {$set: {
                type: "save_to_contact", 
                uuid: this.props.uuid, 
                field: selection.id, 
                name: selection.name, 
                value: input.value
            }});

            // if this was a newly created field, add it to our main list
            if (selection.created) { 
                FlowStore.get().getContactFields().push({
                    id: selection.id,
                    name: selection.name,
                    type: selection.type
                })
            }
        }
    }
}


export default SaveToContact;