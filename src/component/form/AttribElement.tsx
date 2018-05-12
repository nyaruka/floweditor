import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { getTypeConfig, Types } from '../../config/typeConfigs';
import { CreateOptions, ResultType } from '../../flowTypes';
import { Asset, Assets, AssetType } from '../../services/AssetService';
import { AppState, DispatchWithState, UpdateTypeConfig, updateTypeConfig } from '../../store';
import { SetContactFieldFormState, SetContactNameFormState } from '../../store/nodeEditor';
import {
    composeCreateNewOption,
    getSelectClass,
    isOptionUnique,
    isValidNewOption,
    snakify
} from '../../utils';
import SelectSearch from '../SelectSearch/SelectSearch';
import FormElement, { FormElementProps } from './FormElement';

export interface AttribElementPassedProps extends FormElementProps {
    assets: Assets;
    add?: boolean;
    placeholder?: string;
    searchPromptText?: string;
    helpText?: string;
    onChange?(selected: Asset): void;
}

export interface AttribElementStoreProps {
    attribute: Asset;
    updateTypeConfig: UpdateTypeConfig;
}

export type AttribElementProps = AttribElementPassedProps & AttribElementStoreProps;

export const PLACEHOLDER = 'Enter the name of an existing attribute or create a new one';
export const NOT_FOUND = 'Invalid attribute';
export const CREATE_PROMPT = 'New attribute: ';

export const createNewOption = composeCreateNewOption({
    idCb: label => snakify(label),
    type: AssetType.Field
});

export class AttribElement extends React.Component<AttribElementProps> {
    public static defaultProps = {
        placeholder: PLACEHOLDER,
        searchPromptText: NOT_FOUND
    };

    constructor(props: any) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    private onChange(selected: Asset[]): void {
        const [attribute] = selected;
        if (attribute.type === AssetType.Name) {
            this.props.updateTypeConfig(getTypeConfig(Types.set_contact_name));
        } else if (attribute.type === AssetType.Field) {
            this.props.updateTypeConfig(getTypeConfig(Types.set_contact_field));
        }

        if (this.props.onChange) {
            this.props.onChange(attribute);
        }
    }

    public render(): JSX.Element {
        const createOptions: CreateOptions = {};

        if (this.props.add) {
            createOptions.isValidNewOption = isValidNewOption;
            createOptions.isOptionUnique = isOptionUnique;
            createOptions.createNewOption = createNewOption;
            createOptions.createPrompt = CREATE_PROMPT;
        }

        return (
            <FormElement
                showLabel={this.props.showLabel}
                name={this.props.name}
                helpText={this.props.helpText}
                // attribError={this.state.errors.length > 0 }
            >
                <SelectSearch
                    __className={getSelectClass(0)}
                    onChange={this.onChange}
                    name={this.props.name}
                    resultType={ResultType.field}
                    multi={false}
                    assets={this.props.assets}
                    initial={[this.props.attribute]}
                    closeOnSelect={true}
                    searchPromptText={this.props.searchPromptText}
                    placeholder={this.props.placeholder}
                    {...createOptions}
                />
            </FormElement>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({ nodeEditor: { form } }: AppState) => ({
    attribute: (form as SetContactFieldFormState).field || (form as SetContactNameFormState).name
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateTypeConfig
        },
        dispatch
    );

const ConnectedAttribElement = connect<
    { attribute: Asset },
    { updateTypeConfig: UpdateTypeConfig },
    AttribElementPassedProps
>(mapStateToProps, mapDispatchToProps, null, {
    withRef: true
})(AttribElement);

export default ConnectedAttribElement;
