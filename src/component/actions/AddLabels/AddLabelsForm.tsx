import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { ConfigProviderContext } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { Types } from '../../../config/typeConfigs';
import { AddLabels, Label } from '../../../flowTypes';
import AssetService, { Asset, AssetType } from '../../../services/AssetService';
import { DispatchWithState } from '../../../store';
import { AddLabelsFunc, updateAddLabelsForm } from '../../../store/forms';
import { AddLabelsFormState } from '../../../store/nodeEditor';
import AppState from '../../../store/state';
import { validate, validateRequired } from '../../../store/validators';
import LabelsElement from '../../form/LabelsElement';
import { AddLabelsFormHelper } from './AddLabelsFormHelper';

export interface AddLabelsFormStoreProps {
    form: AddLabelsFormState;
    updateAddLabelsForm: AddLabelsFunc;
}

export interface AddLabelsFormPassedProps {
    action: AddLabels;
    updateAction: (action: AddLabels) => void;
    formHelper: AddLabelsFormHelper;
}

export type AddLabelsFormProps = AddLabelsFormPassedProps & AddLabelsFormStoreProps;

export const mapLabelsToAssets = (labels: Label[]): Asset[] =>
    labels.map(({ name, uuid }) => ({ name, id: uuid, type: AssetType.Label }));

export const mapAssetsToLabels = (searchResults: Asset[]): Label[] =>
    searchResults.map(({ id, name }) => ({ uuid: id, name }));

export const createNewAddLabelAction = ({ uuid }: AddLabels, labels: Asset[]) => ({
    uuid,
    type: Types.add_input_labels,
    labels: mapAssetsToLabels(labels)
});

export const LABEL = 'Select the label(s) to apply to the incoming message.';
export const PLACEHOLDER = 'Enter the name of an existing label or create a new one';

export const controlLabelSpecId = 'label';

export class AddLabelsForm extends React.PureComponent<AddLabelsFormProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: AddLabelsFormProps, context: ConfigProviderContext) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public onValid(): void {
        const newAction = this.props.formHelper.stateToAction(
            this.props.action.uuid,
            this.props.form
        );
        this.props.updateAction(newAction);
    }

    public validate(): boolean {
        return this.handleLabelChange(this.props.form.labels.value);
    }

    public handleLabelChange(selected: Asset[]): boolean {
        return (this.props.updateAddLabelsForm({
            labels: validate('Labels', selected, [validateRequired])
        }) as any).valid;
    }

    private getLabels(): Asset[] {
        if (!this.props.action.labels.length) {
            return [];
        }
        return mapLabelsToAssets(this.props.action.labels);
    }

    public render(): JSX.Element {
        return (
            <>
                <p data-spec={controlLabelSpecId}>{LABEL}</p>
                <LabelsElement
                    name="Labels"
                    placeholder={PLACEHOLDER}
                    assets={this.context.assetService.getLabelAssets()}
                    entry={this.props.form.labels}
                    onChange={this.handleLabelChange}
                />
            </>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({ nodeEditor: { form } }: AppState) => ({
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateAddLabelsForm }, dispatch);

const ConnectedAddLabelsForm = connect(mapStateToProps, mapDispatchToProps, null, {
    withRef: true
})(AddLabelsForm);

export default ConnectedAddLabelsForm;
