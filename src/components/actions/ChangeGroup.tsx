import * as React from 'react';
import * as UUID from 'uuid';
import {Action} from '../Action';
import {NodeForm} from '../NodeForm';
import {NodeModalProps} from '../NodeModal';
import {ChangeGroupProps, NodeEditorState, SearchResult} from '../../interfaces';
import {SelectSearch} from '../SelectSearch';

export class ChangeGroup extends Action<ChangeGroupProps> {
    renderNode() { return <div>{this.props.name}</div> }
}

export class ChangeGroupForm extends NodeForm<ChangeGroupProps, NodeEditorState> {

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
        var initial = [{
            id: this.props.group,
            name: this.props.name, 
            type: this.props.type,                    
        }]

        var isValidNewOption = null;
        var createNewOption = null;
        var createPrompt = null;

        var createOptions = {};

        if (this.props.config.type == "add_to_group") {
            createOptions = {
                isValidNewOption: this.isValidNewOption.bind(this),
                createNewOption: this.createNewOption.bind(this),
                createPrompt: "New group: "
            }
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
                    initial={initial}
                    {...createOptions}
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

            console.log("remove group", group, this.props.config.type);

            modal.onUpdateAction({
                uuid: this.props.uuid, 
                type: this.props.config.type,
                name: group.name, 
                group: group.id, 
            } as ChangeGroupProps);

            if (group.extraResult) {
                this.props.context.eventHandler.onAddGroup({
                    id: group.id,
                    name: group.name
                } as SearchResult);
            }
        }
    }
}