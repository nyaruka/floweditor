import * as React from 'react';
import { ConfigProviderContext, endpointsPT } from '../../../config';
import {
    AttributeType,
    SetContactAttribute,
    SetContactField,
    SetContactProperty
} from '../../../flowTypes';
import { SearchResult } from '../../../store';
import { snakify, titleCase, toBoolMap } from '../../../utils';
import TextInputElement from '../../form/TextInputElement';
import ConnectedAttribElement from '../../form/AttribElement';

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

export interface SetContactAttribFormProps {
    action: SetContactAttribute;
    onBindWidget: (ref: any) => void;
    updateAction: (action: SetContactAttribute) => void;
}

export default class SetContactAttribForm extends React.Component<SetContactAttribFormProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: SetContactAttribFormProps, context: ConfigProviderContext) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { wrappedInstance: { state: { value } } } = widgets.Value;
        const { state: { attribute } } = widgets.Attribute.wrappedInstance;

        let newAction: Partial<SetContactAttribute> = {
            uuid: this.props.action.uuid,
            value
        };

        if (attribute.type === 'field') {
            newAction = {
                ...newAction,
                type: 'set_contact_field',
                field: {
                    key: snakify(attribute.name),
                    name: titleCase(attribute.name)
                }
            } as SetContactField;
        } else if (attribute.type === 'property') {
            newAction = {
                ...newAction,
                type: 'set_contact_property',
                property: snakify(attribute.name)
            } as SetContactProperty;
        }

        this.props.updateAction(newAction as SetContactAttribute);
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

    private getInitial(): SearchResult {
        switch (this.props.action.type) {
            case 'set_contact_field':
                return {
                    id: (this.props.action as SetContactField).field.key,
                    name: (this.props.action as SetContactField).field.name,
                    type: AttributeType.field
                };
            case 'set_contact_property':
                return {
                    id: (this.props.action as SetContactProperty).property,
                    name: titleCase((this.props.action as SetContactProperty).property),
                    type: AttributeType.property
                };
            default:
                return null;
        }
    }

    public render(): JSX.Element {
        const initial = this.getInitial();
        return (
            <div>
                <ConnectedAttribElement
                    ref={this.props.onBindWidget}
                    name="Attribute"
                    showLabel={true}
                    endpoint={this.context.endpoints.fields}
                    helpText="Select an existing attribute to update or type any name to create a new one"
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
                />
            </div>
        );
    }
}
