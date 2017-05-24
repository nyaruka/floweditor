import * as React from 'react';
import * as UUID from 'uuid';
import {Action} from '../Action';
import {NodeForm} from '../NodeForm';
import {NodeModalProps} from '../NodeModal';
import {AddToGroupProps, NodeEditorState, SearchResult} from '../../interfaces';
import {SelectSearch} from '../SelectSearch';

export class AddToGroup extends Action<AddToGroupProps> {
    renderNode() { return <div>{this.props.name}</div> }
}

export class AddToGroupForm extends NodeForm<AddToGroupProps, NodeEditorState> {

    private groupSelect: SelectSearch;

    isValidNewOption(option: {label: string}): boolean {
        if (!option || !option.label) { return false; }
        let lowered = option.label.toLowerCase();
        return lowered.length > 0 && lowered.length <= 36 && /^[a-z0-9-][a-z0-9- ]*$/.test(lowered);
    }

    createNewOption(arg: { label: string}): SearchResult {
        var newOption: SearchResult = {
            id: UUID.v4(),
            name: arg.label,
            extraResult: true
        } as SearchResult;

        return newOption;
    }

    renderForm(): JSX.Element { 
        var initial = []
        if (this.props.type == "add_to_group") {
            initial.push({
                id: this.props.group,
                name: this.props.name, 
                type: this.props.type,                    
            })
        }
        return (
            <div>
                <p>Select the groups to add the contact to.</p>
                <SelectSearch
                    ref={(ele: any) => {this.groupSelect = ele}} 
                    className="form-control"
                    name="groups"
                    url={this.props.context.endpoints.groups}
                    localSearchOptions={this.props.context.getGroups()}
                    multi={false}
                    clearable={false}
                    createNewOption={this.createNewOption.bind(this)}
                    isValidNewOption={this.isValidNewOption.bind(this)}
                    createPrompt="New group: "
                    initial={initial}
                />                
                
            </div>
        )
    }

    validate(control: any): string { return null; }
    
    submit(form: Element, modal: NodeModalProps) {
        var selection= this.groupSelect.state.selection;
        var group = null;
        if (selection && selection.length > 0) {
            group = selection[0]
        }

        var input: HTMLInputElement = $(form).find('.value')[0] as HTMLInputElement;

        if (group) {
            modal.onUpdateAction({
                uuid: this.props.uuid, 
                type: "add_to_group", 
                name: group.name, 
                group: group.id, 
            } as AddToGroupProps);

            if (group.extraResult) {
                this.props.context.eventHandler.onAddGroup({
                    id: group.id,
                    name: group.name
                } as SearchResult);
            }
        }
    }
}