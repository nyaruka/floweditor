import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { AddLabelsFormHelper } from '~/components/flow/actions/addlabels/AddLabelsFormHelper';
import { renderChooserDialog } from '~/components/flow/actions/helpers';
import LabelsElement from '~/components/form/select/labels/LabelsElement';
import { ButtonSet } from '~/components/modal/Modal';
import { ConfigProviderContext, Type } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { AddLabels } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { AddLabelsFormState, mergeForm, NodeEditorSettings } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

export interface AddLabelsFormProps {
    // action details
    nodeSettings: NodeEditorSettings;
    formHelper: AddLabelsFormHelper;
    typeConfig: Type;

    // update handlers
    updateAction(action: AddLabels): void;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

export const LABEL = 'Select the label(s) to apply to the incoming message.';
export const PLACEHOLDER = 'Enter the name of an existing label or create a new one';
export const controlLabelSpecId = 'label';

export default class AddLabelsForm extends React.PureComponent<
    AddLabelsFormProps,
    AddLabelsFormState
> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: AddLabelsFormProps, context: ConfigProviderContext) {
        super(props);

        this.state = this.props.formHelper.initializeForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public handleSave(): void {
        const valid = this.handleLabelChange(this.state.labels.value);
        if (valid) {
            const newAction = this.props.formHelper.stateToAction(
                this.props.nodeSettings.originalAction.uuid,
                this.state
            );
            this.props.updateAction(newAction);
            this.props.onClose(false);
        }
    }

    public handleLabelChange(selected: Asset[]): boolean {
        const updates: Partial<AddLabelsFormState> = {
            labels: validate('Labels', selected, [validateRequired])
        };

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public render(): JSX.Element {
        return renderChooserDialog(
            this.props,
            this.getButtons(),
            <>
                <p data-spec={controlLabelSpecId}>{LABEL}</p>
                <LabelsElement
                    name="Labels"
                    placeholder={PLACEHOLDER}
                    assets={this.context.assetService.getLabelAssets()}
                    entry={this.state.labels}
                    onChange={this.handleLabelChange}
                />
            </>
        );
    }
}
