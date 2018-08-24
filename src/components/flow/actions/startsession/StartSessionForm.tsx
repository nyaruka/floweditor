import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { initializeForm, stateToAction } from '~/components/flow/actions/startsession/helpers';
import { ActionFormProps } from '~/components/flow/props';
import SelectAssetElement from '~/components/form/select/assets/SelectAssetElement';
import OmniboxElement from '~/components/form/select/omnibox/OmniboxElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset } from '~/services/AssetService';
import { AssetArrayEntry, AssetEntry, FormState, mergeForm } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

export interface StartSessionFormState extends FormState {
    recipients: AssetArrayEntry;
    flow: AssetEntry;
}

export default class StartSessionForm extends React.Component<
    ActionFormProps,
    StartSessionFormState
> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: ActionFormProps) {
        super(props);

        this.state = initializeForm(this.props.nodeSettings);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public handleRecipientsChanged(recipients: Asset[]): boolean {
        return this.handleUpdate({ recipients });
    }

    public handleFlowChanged(flows: Asset[]): boolean {
        let flow = null;
        if (flows && flows.length > 0) {
            flow = flows[0];
        }
        return this.handleUpdate({ flow });
    }

    private handleUpdate(keys: { flow?: Asset; recipients?: Asset[] }): boolean {
        const updates: Partial<StartSessionFormState> = {};

        if (keys.hasOwnProperty('recipients')) {
            updates.recipients = validate('Recipients', keys.recipients, [validateRequired]);
        }

        if (keys.hasOwnProperty('flow')) {
            updates.flow = validate('Flow', keys.flow, [validateRequired]);
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private handleSave(): void {
        // validate in case they never updated an empty field
        const valid = this.handleUpdate({
            recipients: this.state.recipients.value,
            flow: this.state.flow.value
        });

        if (valid) {
            this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));

            // notify our modal we are done
            this.props.onClose(false);
        }
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
                <div>
                    <OmniboxElement
                        data-spec="recipients"
                        name="Recipients"
                        assets={this.context.assetService.getRecipients()}
                        onChange={this.handleRecipientsChanged}
                        entry={this.state.recipients}
                        add={true}
                    />
                    <p>
                        <SelectAssetElement
                            key="flow_select"
                            name="Flow"
                            searchable={true}
                            placeholder="Select the flow to start them in"
                            entry={this.state.flow}
                            assets={this.context.assetService.getFlowAssets()}
                            onChange={this.handleFlowChanged}
                        />
                    </p>
                </div>
            </Dialog>
        );
    }
}
