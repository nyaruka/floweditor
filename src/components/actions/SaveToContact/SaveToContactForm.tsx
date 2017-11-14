import * as React from 'react';
import { v4 } from 'uuid';
import { SaveToContact, IUpdateContact } from '../../../flowTypes';
import { Type, Endpoints } from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import { toBoolMap } from '../../../helpers/utils';
import SelectSearch from '../../SelectSearch';
import { SearchResult } from '../../../services/ComponentMap';
import FieldElement from '../../form/FieldElement';
import TextInputElement from '../../form/TextInputElement';

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

export interface SaveToContactFormProps {
    action: SaveToContact;
    onValidCallback: Function;
    getActionUUID: Function;
    updateAction(action: SaveToContact): void;
    onBindWidget(ref: any): void;
    ComponentMap: ComponentMap;
    fieldsEndpoint: string;
}

const SaveToContactForm: React.SFC<SaveToContactFormProps> = ({
    action,
    onValidCallback,
    getActionUUID,
    updateAction,
    onBindWidget,
    ComponentMap,
    fieldsEndpoint
}): JSX.Element => {
    onValidCallback((widgets: { [name: string]: any }) => {
        const { state: { value } } = widgets['Value'] as TextInputElement;
        const { state: { field: { type: fieldType, name: field_name, id: field_uuid } } } = widgets[
            'Field'
        ] as FieldElement;

        let newAction;

        if (fieldType === 'field') {
            newAction = {
                uuid: getActionUUID(),
                type: 'save_contact_field',
                field_name,
                field_uuid,
                value
            } as SaveToContact;
        } else if (fieldType === 'update_contact') {
            // updating contact properties are different action
            newAction = {
                uuid: getActionUUID(),
                type: 'update_contact',
                field_name: field_uuid,
                value
            } as IUpdateContact;
        }

        updateAction(newAction);
    });

    const isValidNewOption = (option: { label: string }): boolean => {
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
    };

    const createNewOption = (arg: { label: string }): SearchResult => {
        const newOption: SearchResult = {
            id: v4.v4(),
            name: arg.label,
            type: 'field',
            extraResult: true
        } as SearchResult;

        return newOption;
    };

    const renderForm = (): JSX.Element => {
        let initial: SearchResult;

        if (action) {
            const { type: actionType, field_uuid, field_name } = action;

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

        if (action && action.value) {
            value = action.value;
        }

        return (
            <div>
                <FieldElement
                    ref={onBindWidget}
                    name="Field"
                    showLabel={true}
                    endpoint={fieldsEndpoint}
                    localFields={ComponentMap.getContactFields()}
                    helpText={
                        'Select an existing field to update or type any name to create a new one'
                    }
                    initial={initial}
                    add
                    required
                />

                <TextInputElement
                    ref={onBindWidget}
                    name="Value"
                    showLabel={true}
                    value={value}
                    helpText="The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json."
                    autocomplete
                    ComponentMap={ComponentMap}
                />
            </div>
        );
    };

    return renderForm();
};

export default SaveToContactForm;
