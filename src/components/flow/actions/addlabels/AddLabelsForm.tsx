import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { initializeForm, stateToAction } from '~/components/flow/actions/addlabels/helpers';
import { ActionFormProps } from '~/components/flow/props';
import LabelsElement from '~/components/form/select/labels/LabelsElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset } from '~/services/AssetService';
import { AssetArrayEntry, FormState, mergeForm } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

export interface AddLabelsFormState extends FormState {
    labels: AssetArrayEntry;
}

export const LABEL = 'Select the label(s) to apply to the incoming message.';
export const PLACEHOLDER = 'Enter the name of an existing label or create a new one';
export const controlLabelSpecId = 'label';

export default class AddLabelsForm extends React.PureComponent<
    ActionFormProps,
    AddLabelsFormState
> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: ActionFormProps) {
        super(props);

        this.state = initializeForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public handleSave(): void {
        const valid = this.handleLabelChange(this.state.labels.value);
        if (valid) {
            const newAction = stateToAction(this.props.nodeSettings, this.state);
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
        const typeConfig = this.props.typeConfig;
        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                buttons={this.getButtons()}
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <p data-spec={controlLabelSpecId}>{LABEL}</p>
                <LabelsElement
                    name="Labels"
                    placeholder={PLACEHOLDER}
                    assets={this.context.assetService.getLabelAssets()}
                    entry={this.state.labels}
                    onChange={this.handleLabelChange}
                />
            </Dialog>
        );
    }
}
