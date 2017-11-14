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
    config: Type;
    updateAction(action: SaveToContact): void;
    onBindWidget(ref: any): void;
    endpoints: Endpoints;
    ComponentMap: ComponentMap;
}

const SaveToContactForm: React.SFC<SaveToContactFormProps> = ({
    action,
    onValidCallback,
    getActionUUID,
    config,
    updateAction,
    onBindWidget,
    ComponentMap,
    endpoints
}): JSX.Element => {
    onValidCallback((widgets: { [name: string]: any }) => {
        const fieldEle = widgets['Field'] as FieldElement;
        const valueEle = widgets['Value'] as TextInputElement;

        const { state: { field } } = fieldEle;

        let newAction;

        if (field.type === 'field') {
            newAction = {
                uuid: getActionUUID(),
                type: 'save_contact_field',
                field_name: field.name,
                field_uuid: field.id,
                value: valueEle.state.value
            } as SaveToContact;
        } else if (field.type === 'update_contact') {
            // updating contact properties are different action
            newAction = {
                uuid: getActionUUID(),
                type: 'update_contact',
                field_name: field.id,
                value: valueEle.state.value
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
            if (action.type === 'save_contact_field') {
                initial = {
                    id: action.field_uuid,
                    name: action.field_name,
                    type: 'field'
                };
            } else if (action.type === 'update_contact') {
                initial = {
                    id: action.field_name.toLowerCase(),
                    name: action.field_name,
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
                    endpoint={endpoints.fields}
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
