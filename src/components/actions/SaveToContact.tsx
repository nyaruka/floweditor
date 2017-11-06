import * as React from 'react';
import * as UUID from 'uuid';
import { ISaveToContact, IUpdateContact } from '../../flowTypes';
import { toBoolMap } from '../../helpers/utils';
import { SelectSearch } from '../SelectSearch';
import { ISearchResult } from '../../services/ComponentMap';
import { ActionComp } from '../Action';
import { FieldElement } from '../form/FieldElement';
import { TextInputElement } from '../form/TextInputElement';
import NodeActionForm from '../NodeEditor/NodeActionForm';
import Widget from '../NodeEditor/Widget';

// TODO: these should come from an external source
const reserved = toBoolMap([
    'language',
    'facebook',
    'telegram',
    'email',
    'mailto',
    'name',
    'first name',
    'phone',
    'groups',
    'uuid',
    'created by',
    'modified by',
    'org',
    'is',
    'has',
    'tel'
]);

export class SaveToContactComp extends ActionComp<ISaveToContact> {
    renderNode() {
        const action = this.getAction();
        if (action.value) {
            return (
                <div>
                    Update <span className="emph">{action.field_name}</span> to{' '}
                    {this.getAction().value}
                </div>
            );
        } else {
            return (
                <div>
                    Clear value for <span className="emph">{action.field_name}</span>
                </div>
            );
        }
    }
}

export class SaveToContactForm extends NodeActionForm<ISaveToContact> {
    fieldValue: string;
    fieldSelect: SelectSearch;

    isValidNewOption(option: { label: string }): boolean {
        if (!option || !option.label) {
            return false;
        }
        let lowered = option.label.toLowerCase();
        return (
            lowered.length > 0 &&
            lowered.length <= 36 &&
            /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) &&
            !reserved[lowered]
        );
    }

    createNewOption(arg: { label: string }): ISearchResult {
        var newOption: ISearchResult = {
            id: UUID.v4(),
            name: arg.label,
            type: 'field',
            extraResult: true
        } as ISearchResult;

        return newOption;
    }

    renderForm(ref: any): JSX.Element {
        var initial: ISearchResult = null;
        var action = this.getInitial();

        if (action) {
            if (action.type == 'save_contact_field') {
                initial = {
                    id: action.field_uuid,
                    name: action.field_name,
                    type: 'field'
                };
            } else if (action.type == 'update_contact') {
                initial = {
                    id: action.field_name.toLowerCase(),
                    name: action.field_name,
                    type: 'update_contact'
                };
            }
        }

        var value = '';
        if (action && action.value) {
            value = action.value;
        }

        return (
            <div>
                <FieldElement
                    ref={ref}
                    name="Field"
                    showLabel={true}
                    endpoint={this.props.endpoints.fields}
                    localFields={this.props.ComponentMap.getContactFields()}
                    helpText={
                        'Select an existing field to update or type any name to create a new one'
                    }
                    initial={initial}
                    add
                    required
                />

                <TextInputElement
                    ref={ref}
                    name="Value"
                    showLabel={true}
                    value={value}
                    helpText="The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json."
                    autocomplete
                    ComponentMap={this.props.ComponentMap}
                />
            </div>
        );
    }

    onValid(widgets: { [name: string]: Widget }) {
        var fieldEle = widgets['Field'] as FieldElement;
        var valueEle = widgets['Value'] as TextInputElement;

        var field = fieldEle.state.field;

        var newAction = null;
        if (field.type == 'field') {
            newAction = {
                uuid: this.getActionUUID(),
                type: 'save_contact_field',
                field_name: field.name,
                field_uuid: field.id,
                value: valueEle.state.value
            } as ISaveToContact;
        } else if (field.type == 'update_contact') {
            // updating contact properties are different action
            newAction = {
                uuid: this.getActionUUID(),
                type: 'update_contact',
                field_name: field.id,
                value: valueEle.state.value
            } as IUpdateContact;
        }
        this.props.updateAction(newAction);
    }
}

export default ISaveToContact;
