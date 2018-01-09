import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { Endpoints, SaveToContact, UpdateContact } from '../../../flowTypes';
import { FormProps } from '../../NodeEditor';
import ComponentMap from '../../../services/ComponentMap';
import { toBoolMap } from '../../../helpers/utils';
import SelectSearch from '../../SelectSearch';
import { SearchResult } from '../../../services/ComponentMap';
import FieldElement from '../../form/FieldElement';
import TextInputElement from '../../form/TextInputElement';
import { endpointsPT } from '../../../providers/ConfigProvider/propTypes';
import { ConfigProviderContext } from '../../../providers/ConfigProvider/configContext';

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
    getActionUUID(): string;
    updateAction(action: SaveToContact): void;
    onBindWidget(ref: any): void;
    ComponentMap: ComponentMap;
}

export default class SaveToContactForm extends React.PureComponent<SaveToContactFormProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: SaveToContactFormProps, context: ConfigProviderContext) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { state: { value } } = widgets.Value as TextInputElement;
        const {
            state: { field: { type: fieldType, name: fieldName, id: fieldUUID } }
        } = widgets.Field as FieldElement;

        const newAction: any = {
            uuid: this.props.getActionUUID(),
            value
        };

        if (fieldType === 'field') {
            newAction.type = 'save_contact_field';
            newAction.field_name = fieldName;
            newAction.field_uuid = fieldUUID;
        } else if (fieldType === 'update_contact') {
            // Updating contact properties are different action
            newAction.type = 'update_contact';
            newAction.field_name = fieldUUID;
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
    public render(): JSX.Element {
        let initial: SearchResult;

        if (this.props.action) {
            const {
                type: actionType,
                field_uuid: fieldUUID,
                field_name: fieldName
            } = this.props.action;

            if (actionType === 'save_contact_field') {
                initial = {
                    id: fieldUUID,
                    name: fieldName,
                    type: 'field'
                };
            } else if (actionType === 'update_contact') {
                initial = {
                    id: fieldName.toLowerCase(),
                    name: fieldName,
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
                    endpoint={this.context.endpoints.fields}
                    localFields={this.props.ComponentMap.getContactFields()}
                    helpText={
                        'Select an existing field to update or type any name to create a new one'
                    }
                    initial={initial}
                    add={true}
                    required={true}
                />

                <TextInputElement
                    ref={this.props.onBindWidget}
                    name="Value"
                    showLabel={true}
                    value={value}
                    helpText="The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json."
                    autocomplete={true}
                    ComponentMap={this.props.ComponentMap}
                />
            </div>
        );
    }
}
