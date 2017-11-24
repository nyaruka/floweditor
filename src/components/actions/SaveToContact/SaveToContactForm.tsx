import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { SaveToContact, IUpdateContact } from '../../../flowTypes';
import { Endpoints } from '../../../editor.config';
import { Type } from '../../../services/EditorConfig';
import { FormProps } from '../../NodeEditor';
import ComponentMap from '../../../services/ComponentMap';
import { toBoolMap } from '../../../helpers/utils';
import SelectSearch from '../../SelectSearch';
import { SearchResult } from '../../../services/ComponentMap';
import FieldElement from '../../form/FieldElement';
import TextInputElement from '../../form/TextInputElement';

/** TODO: these should come from an external source */
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

export interface SaveToContactFormProps extends FormProps {
    action: SaveToContact;
    getActionUUID: Function;
    updateAction(action: SaveToContact): void;
    onBindWidget(ref: any): void;
    ComponentMap: ComponentMap;
    endpoints: Endpoints;
}

export default class SaveToContactForm extends React.PureComponent<SaveToContactFormProps> {
    constructor(props: SaveToContactFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }) {
        const { state: { value } } = widgets['Value'] as TextInputElement;
        const { state: { field: { type: fieldType, name: field_name, id: field_uuid } } } = widgets[
            'Field'
        ] as FieldElement;

        let newAction;

        if (fieldType === 'field') {
            newAction = {
                uuid: this.props.getActionUUID(),
                type: 'save_contact_field',
                field_name,
                field_uuid,
                value
            } as SaveToContact;
        } else if (fieldType === 'update_contact') {
            /** Updating contact properties are different action **/
            newAction = {
                uuid: this.props.getActionUUID(),
                type: 'update_contact',
                field_name: field_uuid,
                value
            } as IUpdateContact;
        }

        this.props.updateAction(newAction);
    }

    public isValidNewOption(option: { label: string }): boolean {
        if (!option || !option.label) {
            return false;
        }
        const lowered = option.label.toLowerCase();
        return (
            lowered.length > 0 &&
            lowered.length <= 36 &&
            /^[a-z0-9-][a-z0-9- ]*$/.test(lowered) &&
            !reserved[lowered]
        );
    }

    public renderForm(): JSX.Element {
        let initial: SearchResult;

        if (this.props.action) {
            const { type: actionType, field_uuid, field_name } = this.props.action;

            if (actionType === 'save_contact_field') {
                initial = {
                    id: field_uuid,
                    name: field_name,
                    type: 'field'
                };
            } else if (actionType === 'update_contact') {
                initial = {
                    id: field_name.toLowerCase(),
                    name: field_name,
                    type: 'update_contact'
                };
            }
        }

        let value = '';

        if (this.props.action && this.props.action.value) {
            ({ action: { value } } = this.props);
        }

        return (
            <div>
                <FieldElement
                    ref={this.props.onBindWidget}
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
                    ref={this.props.onBindWidget}
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

    public render(): JSX.Element {
        return this.renderForm();
    }
}
