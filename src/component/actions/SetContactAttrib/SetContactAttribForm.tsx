import * as React from 'react';
import { connect } from 'react-redux';
import { v4 as generateUUID } from 'uuid';
import { ConfigProviderContext, endpointsPT } from '../../../config';
import { SetContactAttribute, SetContactField, SetContactProperty } from '../../../flowTypes';
import { AppState, SearchResult } from '../../../store';
import { toBoolMap } from '../../../utils';
import AttribElement from '../../form/AttribElement';
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

export interface SetContactAttribFormProps {
    contactAttributes: SearchResult[];
    action: SetContactAttribute;
    updateAction: (action: SetContactAttribute) => void;
    onBindWidget: (ref: any) => void;
}

export class SetContactAttribForm extends React.Component<SetContactAttribFormProps> {
    public static contextTypes = {
        endpoints: endpointsPT
    };

    constructor(props: SetContactAttribFormProps, context: ConfigProviderContext) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { wrappedInstance: { state: { value } } } = widgets.Value;
        const { state: { attribute } } = widgets.Attribute;

        let newAction: Partial<SetContactAttribute> = {
            uuid: this.props.action.uuid,
            value
        };

        if (attribute.type === 'field') {
            console.log('attributeId:', attribute.id);
            newAction = {
                ...newAction,
                type: 'set_contact_field',
                field_name: attribute.name,
                field_uuid: attribute.id
            } as SetContactField;
        } else if (attribute.type === 'property') {
            console.log('attributeId:', attribute.id);
            newAction = {
                ...newAction,
                type: 'set_contact_property',
                property_name: attribute.name,
                property_uuid: attribute.id
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
                    id: this.props.action.uuid,
                    name: (this.props.action as SetContactField).field_name,
                    type: 'field'
                };
            case 'set_contact_property':
                return {
                    id: this.props.action.uuid,
                    name: (this.props.action as SetContactProperty).property_name,
                    type: 'property'
                };
            default:
                return null;
        }
    }

    public render(): JSX.Element {
        const initial = this.getInitial();
        return (
            <div>
                <AttribElement
                    ref={this.props.onBindWidget}
                    name="Attribute"
                    showLabel={true}
                    endpoint={this.context.endpoints.fields}
                    localFields={this.props.contactAttributes}
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

const maptStateToProps = ({ flowContext: { contactAttributes } }: AppState) => ({
    contactAttributes
});

const ConnectedSetContactFieldForm = connect(maptStateToProps, null, null, { withRef: true })(
    SetContactAttribForm
);

export default ConnectedSetContactFieldForm;
