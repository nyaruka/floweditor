import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ConfigProviderContext, Type } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { Types } from '../../../config/typeConfigs';
import { Channel, SetContactAttribute } from '../../../flowTypes';
import AssetService, { Asset, ChannelAssets } from '../../../services/AssetService';
import { AppState, DispatchWithState } from '../../../store';
import { SetContactAttribFunc, updateSetContactAttribForm } from '../../../store/forms';
import {
    AssetEntry,
    SetContactAttribFormState,
    SetContactChannelFormState,
    SetContactFieldFormState,
    SetContactLanguageFormState,
    SetContactNameFormState,
    ValidationFailure
} from '../../../store/nodeEditor';
import { validate, ValidatorFunc } from '../../../store/validators';
import { renderIf } from '../../../utils';
import ConnectedAttribElement from '../../form/AttribElement';
import FormElement from '../../form/FormElement';
import ConnectedTextInputElement from '../../form/TextInputElement';
import SelectSearch from '../../SelectSearch/SelectSearch';
import { SetContactAttribFormHelper } from './SetContactAttribFormHelper';

export interface SetContactAttribFormPassedProps {
    action: SetContactAttribute;
    formHelper: SetContactAttribFormHelper;
    updateAction: (action: SetContactAttribute) => void;
}

export interface SetContactAttribFormStoreProps {
    languages: Asset[];
    baseLanguage: Asset;
    typeConfig: Type;
    form: SetContactAttribFormState;
    updateSetContactAttribForm: SetContactAttribFunc;
}

export type SetContactAttribFormProps = SetContactAttribFormPassedProps &
    SetContactAttribFormStoreProps;

interface DropDownProps {
    initial: Asset[];
    assetService: ChannelAssets;
    onChange: ([selection]: Asset[]) => void;
    localSearchOptions?: Asset[];
}

export enum SetContactAttribFormElementNames {
    Attribute = 'Attribute',
    Value = 'Value',
    Language = 'Language',
    Channel = 'Channel'
}

export const ATTRIB_HELP_TEXT =
    'Select an existing attribute to update or type any name to create a new one';
export const TEXT_INPUT_HELP_TEXT =
    'The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json.';

/*
    In our case, we have an asset object with just the type defined to deal with
    switching. This means we need a special required validator that looks at asset
    id and name instead of the entire object.
    TODO: allow for switching without a faux-asset and remove this
*/
const validateAssetRequired: ValidatorFunc = (name: string, input: Asset): ValidationFailure[] => {
    const asset = input as Asset;
    if (!asset.id || !asset.name) {
        return [{ message: `${name} is required` }];
    }
    return [];
};

// Note: `LanguageDropDown` & `ChannelDropDown`
// are here to ensure `Async` in `SelectSearch` unmounts/mounts when
// the attribute to update is changed. `Async` calls its `loadOptions`
// callback in `componentDidMount`.
const LanguageDropDown: React.SFC<DropDownProps> = ({
    initial,
    assetService,
    localSearchOptions,
    onChange
}) => (
    <FormElement
        showLabel={true}
        name={SetContactAttribFormElementNames.Language}
        helpText="Select the contact's preferred language."
    >
        <SelectSearch
            assets={assetService}
            actionClearable={true}
            searchable={false}
            multi={false}
            initial={initial}
            name={name}
            localSearchOptions={localSearchOptions}
            closeOnSelect={true}
            onChange={onChange}
            placeholder="Select a language..."
        />
    </FormElement>
);

const ChannelDropDown: React.SFC<DropDownProps> = ({ initial, assetService, onChange }) => (
    <FormElement
        showLabel={true}
        name={SetContactAttribFormElementNames.Channel}
        helpText="Select the contact's primary channel."
    >
        <SelectSearch
            assets={assetService}
            actionClearable={true}
            searchable={false}
            multi={false}
            initial={initial}
            name={name}
            closeOnSelect={true}
            onChange={onChange}
            placeholder="Select a channel..."
        />
    </FormElement>
);

// Note: action prop is only used for its uuid (see onValid)
export class SetContactAttribForm extends React.Component<SetContactAttribFormProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: SetContactAttribFormProps, context: ConfigProviderContext) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/, /^handle/, /^get/]
        });
    }

    public onValid(): void {
        if (this.props.typeConfig.type === Types.set_contact_field) {
            // if it's a field, add to our in-memory asset service
            this.context.assetService
                .getFieldAssets()
                .add((this.props.form as SetContactFieldFormState).field);
        }

        // update action
        this.props.updateAction(
            this.props.formHelper.stateToAction(
                this.props.action.uuid,
                this.props.form,
                this.props.typeConfig.type
            )
        );
    }

    public validate(): boolean {
        return this.handleAttribChange(this.getAttributeEntry().value);
    }

    public handleAttribChange(attribute: Asset): boolean {
        return (this.props.updateSetContactAttribForm(
            validate('Attribute', attribute, [validateAssetRequired])
        ) as any).valid;
    }

    public handleValueChange(value: string): void {
        this.props.updateSetContactAttribForm(
            null,
            validate(SetContactAttribFormElementNames.Value, value, [])
        );
    }

    // For `set_contact_language`, `set_contact_channel` forms
    public handleDropDownChange([selection]: Asset[]): void {
        let name;

        switch (this.props.typeConfig.type) {
            case Types.set_contact_language:
                name = SetContactAttribFormElementNames.Language;
                break;
            case Types.set_contact_channel:
                name = SetContactAttribFormElementNames.Channel;
                break;
        }

        this.props.updateSetContactAttribForm(null, validate(name, selection, []));
    }

    // Only used for `set_contact_field`, `set_contact_name` actions,
    // as they're currently the only contact attribute actions whose forms require a text input.
    private getValue(): string {
        let value;

        switch (this.props.typeConfig.type) {
            case Types.set_contact_field:
            case Types.set_contact_name:
                ({ value: { value } } = this.props.form);
                break;
            default:
                value = '';
                break;
        }

        return value as string;
    }

    private getAttributeEntry(): AssetEntry {
        let entry;

        switch (this.props.typeConfig.type) {
            case Types.set_contact_field:
                ({ field: entry } = this.props.form as SetContactFieldFormState);
                break;
            case Types.set_contact_name:
                ({ name: entry } = this.props.form as SetContactNameFormState);
                break;
            case Types.set_contact_language:
                ({ language: entry } = this.props.form as SetContactLanguageFormState);
                break;
            case Types.set_contact_channel:
                ({ channel: entry } = this.props.form as SetContactChannelFormState);
                break;
        }

        return entry;
    }

    // Get initial selection for dropdown
    private getInitialDropDownValue(): Asset[] {
        return [(this.props.form as SetContactAttribFormState).value.value] as Asset[];
    }

    private getDropDown(): JSX.Element {
        if (this.props.form.hasOwnProperty('language')) {
            return (
                <LanguageDropDown
                    initial={this.getInitialDropDownValue()}
                    assetService={this.context.assetService.getLanguageAssets()}
                    onChange={this.handleDropDownChange}
                />
            );
        } else if (this.props.form.hasOwnProperty('channel')) {
            return (
                <ChannelDropDown
                    initial={this.getInitialDropDownValue()}
                    assetService={this.context.assetService.getChannelAssets()}
                    onChange={this.handleDropDownChange}
                />
            );
        }
    }

    public render(): JSX.Element {
        const requiresDropDown =
            this.props.form.hasOwnProperty('language') || this.props.form.hasOwnProperty('channel');
        return (
            <>
                <ConnectedAttribElement
                    name={SetContactAttribFormElementNames.Attribute}
                    showLabel={true}
                    assets={this.context.assetService.getFieldAssets()}
                    helpText={ATTRIB_HELP_TEXT}
                    add={true}
                    entry={this.getAttributeEntry()}
                    onChange={this.handleAttribChange}
                />
                {renderIf(requiresDropDown)(
                    this.getDropDown(),
                    <ConnectedTextInputElement
                        name={SetContactAttribFormElementNames.Value}
                        showLabel={true}
                        entry={{ value: this.getValue() }}
                        helpText={TEXT_INPUT_HELP_TEXT}
                        autocomplete={true}
                        onChange={this.handleValueChange}
                    />
                )}
            </>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: { languages, baseLanguage },
    nodeEditor: { typeConfig, form }
}: AppState) => ({
    languages,
    baseLanguage,
    typeConfig,
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateSetContactAttribForm }, dispatch);

const ConnectedSetContactAttribForm = connect(mapStateToProps, mapDispatchToProps, null, {
    withRef: true
})(SetContactAttribForm);

export default ConnectedSetContactAttribForm;
