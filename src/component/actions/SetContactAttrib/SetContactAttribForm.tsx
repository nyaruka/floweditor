import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ConfigProviderContext, Type } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { Types } from '../../../config/typeConfigs';
import { ResultType, SetContactAttribute } from '../../../flowTypes';
import AssetService, { Asset } from '../../../services/AssetService';
import { AppState, DispatchWithState } from '../../../store';
import { SetContactAttribFunc, updateSetContactAttribForm } from '../../../store/forms';
import {
    AssetEntry,
    SetContactAttribFormState,
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

export const ATTRIB_HELP_TEXT =
    'Select an existing attribute to update or type any name to create a new one';
export const TEXT_INPUT_HELP_TEXT =
    'The value to store can be any text you like. You can also reference other values that have been collected up to this point by typing @run.results or @webhook.json.';

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
        this.props.updateSetContactAttribForm(null, validate('Value', value, []));
    }

    public handleLanguageChange([language]: Asset[]): void {
        this.props.updateSetContactAttribForm(
            null,
            validate('Language', language, [validateAssetRequired])
        );
    }

    private getValue(): string {
        switch (this.props.typeConfig.type) {
            case Types.set_contact_field:
                return (this.props.form as SetContactFieldFormState).value.value;
            case Types.set_contact_name:
                return (this.props.form as SetContactNameFormState).value.value;
        }
    }

    private getAttributeEntry(): AssetEntry {
        switch (this.props.typeConfig.type) {
            case Types.set_contact_field:
                return (this.props.form as SetContactFieldFormState).field;
            case Types.set_contact_name:
                return (this.props.form as SetContactNameFormState).name;
            case Types.set_contact_language:
                return (this.props.form as SetContactLanguageFormState).language;
        }
    }

    private getLanguage(): Asset[] {
        const language: Asset[] = [];
        if ((this.props.form as SetContactLanguageFormState).value.value) {
            return [...language, (this.props.form as SetContactLanguageFormState).value.value];
        }
        return [...language];
    }

    private getLanguageDropDown(): JSX.Element {
        return (
            <FormElement
                showLabel={true}
                name="Language"
                helpText="Select the contact's preferred language."
            >
                <SelectSearch
                    resultType={ResultType.language}
                    localSearchOptions={this.props.languages}
                    searchable={false}
                    multi={false}
                    initial={this.getLanguage()}
                    name="Languages"
                    closeOnSelect={true}
                    onChange={this.handleLanguageChange}
                    placeholder="Select a language..."
                />
            </FormElement>
        );
    }

    public render(): JSX.Element {
        return (
            <>
                <ConnectedAttribElement
                    name="Attribute"
                    showLabel={true}
                    assets={this.context.assetService.getFieldAssets()}
                    helpText={ATTRIB_HELP_TEXT}
                    add={true}
                    entry={this.getAttributeEntry()}
                    onChange={this.handleAttribChange}
                />
                {renderIf(
                    (this.props.form as SetContactLanguageFormState).hasOwnProperty('language')
                )(
                    this.getLanguageDropDown(),
                    <ConnectedTextInputElement
                        name="Value"
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
