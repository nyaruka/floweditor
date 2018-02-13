import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { Endpoints, SaveToContact, UpdateContact } from '../../../flowTypes';
import { FormProps } from '../../NodeEditor';
import ComponentMap from '../../../services/ComponentMap';
import { toBoolMap } from '../../../utils';
import SelectSearch from '../../SelectSearch';
import { SearchResult } from '../../../services/ComponentMap';
import FieldElement from '../../form/FieldElement';
import TextInputElement from '../../form/TextInputElement';
import { endpointsPT } from '../../../config';

export interface SaveToContactFormProps extends FormProps {
    action: SaveToContact;
    updateAction(action: SaveToContact): void;
    onBindWidget(ref: any): void;
    ComponentMap: ComponentMap;
}

export const HELP_TEXT_FIELD =
    'Select an existing field to update, or create a new one.';
export const HELP_TEXT_VALUE =
    'The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json.';
export const FIELD_INVALID = 'Invalid field name';

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

export default class SaveToContactForm extends React.PureComponent<
    SaveToContactFormProps
> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: SaveToContactFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { state: { value } } = widgets.Value as TextInputElement;
        const { state: { field } } = widgets.Field as FieldElement;

        const newAction: any = {
            uuid: this.props.action.uuid,
            value
        };

        if (field.type === 'field') {
            newAction.type = 'save_contact_field';
            newAction.field_name = field.name;
            newAction.field_uuid = field.id;
        } else if (field.type === 'update_contact') {
            // Updating contact properties are different action
            newAction.type = 'update_contact';
            newAction.field_name = field.id;
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
        let initial: SearchResult = null;

        if (this.props.action.type === 'save_contact_field') {
            initial = {
                id: this.props.action.field_uuid,
                name: this.props.action.field_name,
                type: 'field'
            };
        } else if (this.props.action.type === 'update_contact') {
            initial = {
                id: this.props.action.field_name.toLowerCase(),
                name: this.props.action.field_name,
                type: 'update_contact'
            };
        }

        return (
            <>
                <FieldElement
                    ref={this.props.onBindWidget}
                    name="Field"
                    showLabel={true}
                    endpoint={this.context.endpoints.fields}
                    localFields={this.props.ComponentMap.getContactFields()}
                    helpText={HELP_TEXT_FIELD}
                    initial={initial}
                    add={true}
                    required={true}
                    placeholder={`${HELP_TEXT_FIELD}..`}
                    searchPromptText={FIELD_INVALID}
                />
                <TextInputElement
                    ref={this.props.onBindWidget}
                    name="Value"
                    showLabel={true}
                    value={this.props.action.value}
                    helpText={HELP_TEXT_VALUE}
                    autocomplete={true}
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
                />
            </>
        );
    }
}
