import * as React from 'react';
import { ConfigProviderContext } from '../../../config';
import { Types } from '../../../config/typeConfigs';
import { SetContactAttribute, SetContactField, SetContactProperty } from '../../../flowTypes';
import ConnectedAttribElement from '../../form/AttribElement';
import ConnectedTextInputElement from '../../form/TextInputElement';
import { newFieldAction, newPropertyAction, fieldToAsset, propertyToAsset } from './helpers';
import { fakePropType } from '../../../config/ConfigProvider';
import AssetService, { Asset, AssetType } from '../../../services/AssetService';

export interface SetContactAttribFormProps {
    action: SetContactAttribute;
    onBindWidget: (ref: any) => void;
    updateAction: (action: SetContactAttribute) => void;
}

export const ATTRIB_HELP_TEXT =
    'Select an existing attribute to update or type any name to create a new one';
export const TEXT_INPUT_HELP_TEXT =
    'The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json.';

export default class SetContactAttribForm extends React.Component<SetContactAttribFormProps> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: SetContactAttribFormProps, context: ConfigProviderContext) {
        super(props);
        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { wrappedInstance: { state: { attribute } } } = widgets.Attribute;
        const { wrappedInstance: { state: { value } } } = widgets.Value;

        if (attribute.type === AssetType.Field) {
            // include our contact field in our local storage
            const assetService: AssetService = this.context.assetService;
            assetService.getFieldAssets().add(attribute);
            this.props.updateAction(newFieldAction(this.props.action.uuid, value, attribute.name));
        } else {
            this.props.updateAction(
                newPropertyAction(this.props.action.uuid, value, attribute.name)
            );
        }
    }

    private getInitial(): Asset {
        if (this.props.action.type === Types.set_contact_field) {
            return fieldToAsset(this.props.action as SetContactField);
        } else {
            return propertyToAsset(this.props.action as SetContactProperty);
        }
    }

    public render(): JSX.Element {
        const initial = this.getInitial();
        return (
            <>
                <ConnectedAttribElement
                    ref={this.props.onBindWidget}
                    name="Attribute"
                    showLabel={true}
                    assets={this.context.assetService.getFieldAssets()}
                    helpText={ATTRIB_HELP_TEXT}
                    initial={initial}
                    add={true}
                    required={true}
                />
                <ConnectedTextInputElement
                    ref={this.props.onBindWidget}
                    name="Value"
                    showLabel={true}
                    value={this.props.action.value}
                    helpText={TEXT_INPUT_HELP_TEXT}
                    autocomplete={true}
                />
            </>
        );
    }
}
