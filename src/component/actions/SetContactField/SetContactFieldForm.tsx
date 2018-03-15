import * as React from 'react';
import { ConfigProviderContext, endpointsPT } from '../../../config';
import { SetContactField } from '../../../flowTypes';
import ComponentMap, { SearchResult } from '../../../services/ComponentMap';
import { toBoolMap } from '../../../utils';
import FieldElement from '../../form/FieldElement';
import TextInputElement from '../../form/TextInputElement';
import { FormProps } from '../../NodeEditor';

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

export interface SetContactFieldFormProps extends FormProps {
    action: SetContactField;
    updateAction(action: SetContactField): void;
    onBindWidget(ref: any): void;
    ComponentMap: ComponentMap;
}

export default class SetContactFieldForm extends React.PureComponent<SetContactFieldFormProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: SetContactFieldFormProps, context: ConfigProviderContext) {
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
            newAction.type = 'set_contact_field';
            newAction.field_name = field.name;
            newAction.field_uuid = field.id;
        } else if (field.type === 'set_contact_property') {
            // Updating contact properties are different action
            newAction.type = 'set_contact_property';
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
        let initial: SearchResult;

        if (this.props.action.type === 'set_contact_field') {
            initial = {
                id: this.props.action.field_uuid,
                name: this.props.action.field_name,
                type: 'field'
            };
        } else if (this.props.action.type === 'set_contact_property') {
            initial = {
                id: this.props.action.field_name.toLowerCase(),
                name: this.props.action.field_name,
                type: 'set_contact_property'
            };
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
                    value={this.props.action.value}
                    helpText="The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json."
                    autocomplete={true}
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
                />
            </div>
        );
    }
}
