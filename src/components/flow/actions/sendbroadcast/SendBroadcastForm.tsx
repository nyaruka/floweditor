import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import * as styles from '~/components/flow/actions/action/Action.scss';
import * as broadcastStyles from '~/components/flow/actions/sendbroadcast/SendBroadcast.scss';
import { SendBroadcastFormHelper } from '~/components/flow/actions/sendbroadcast/SendBroadcastFormHelper';
import OmniboxElement from '~/components/form/select/omnibox/OmniboxElement';
import TextInputElement, { Count } from '~/components/form/textinput/TextInputElement';
import { UpdateLocalizations } from '~/components/nodeeditor/NodeEditor';
import TypeList from '~/components/nodeeditor/TypeList';
import { Type } from '~/config';
import { fakePropType } from '~/config/ConfigProvider';
import { BroadcastMsg } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { mergeForm, NodeEditorSettings, SendBroadcastFormState } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

export interface SendBroadcastFormProps {
    // localization
    language: Asset;
    translating: boolean;

    // action details
    nodeSettings: NodeEditorSettings;
    formHelper: SendBroadcastFormHelper;
    typeConfig: Type;

    // update handlers
    updateAction(action: BroadcastMsg): void;
    updateLocalizations: UpdateLocalizations;

    // modal notifiers
    onTypeChange(config: Type): void;
    onClose(canceled: boolean): void;
}

// Note: action prop is only used for its uuid (see onValid)
export default class SendBroadcastForm extends React.Component<
    SendBroadcastFormProps,
    SendBroadcastFormState
> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: SendBroadcastFormProps) {
        super(props);
        this.state = this.props.formHelper.initializeForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public handleRecipientsChanged(recipients: Asset[]): boolean {
        return this.handleUpdate({ recipients });
    }

    public handleMessageUpdate(text: string): boolean {
        return this.handleUpdate({ text });
    }

    private handleUpdate(keys: { text?: string; recipients?: Asset[] }): boolean {
        const updates: Partial<SendBroadcastFormState> = {};

        if (keys.hasOwnProperty('recipients')) {
            updates.recipients = validate('Recipients', keys.recipients, [validateRequired]);
        }

        if (keys.hasOwnProperty('text')) {
            const messageValidators = [];
            if (!this.props.translating) {
                messageValidators.push(validateRequired);
            }
            updates.text = validate('Message', keys.text, messageValidators);
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private handleSave(): void {
        if (this.props.translating) {
            const { text } = this.state;
            this.props.updateLocalizations(this.props.language.id, [
                {
                    uuid: this.props.nodeSettings.originalAction.uuid,
                    translations: {
                        text: text.value
                    }
                }
            ]);

            // notify our modal we are done
            this.props.onClose(false);
        } else {
            // validate in case they never updated an empty field
            const valid = this.handleUpdate({
                text: this.state.text.value,
                recipients: this.state.recipients.value
            });

            if (valid) {
                this.props.updateAction(
                    this.props.formHelper.stateToAction(
                        this.props.nodeSettings.originalAction.uuid,
                        this.state
                    )
                );

                // notify our modal we are done
                this.props.onClose(false);
            }
        }
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public renderEdit(): JSX.Element {
        return (
            <Dialog
                title={this.props.typeConfig.name}
                headerClass={this.props.typeConfig.type}
                buttons={this.getButtons()}
            >
                <TypeList
                    __className=""
                    initialType={this.props.typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <OmniboxElement
                    data-spec="recipients"
                    className={broadcastStyles.recipients}
                    name="Recipients"
                    assets={this.context.assetService.getRecipients()}
                    entry={this.state.recipients}
                    add={true}
                    onChange={this.handleRecipientsChanged}
                />
                <TextInputElement
                    name="Message"
                    showLabel={false}
                    count={Count.SMS}
                    onChange={this.handleMessageUpdate}
                    entry={this.state.text}
                    autocomplete={true}
                    focus={true}
                    textarea={true}
                />
            </Dialog>
        );
    }

    public renderTranslate(): JSX.Element {
        return (
            <Dialog
                title={this.props.typeConfig.name}
                headerClass={this.props.typeConfig.type}
                buttons={this.getButtons()}
            >
                <div data-spec="translation-container">
                    <div data-spec="text-to-translate" className={styles.translate_from}>
                        {(this.props.nodeSettings.originalAction as BroadcastMsg).text}
                    </div>
                </div>

                <TextInputElement
                    name="Message"
                    showLabel={false}
                    count={Count.SMS}
                    onChange={this.handleMessageUpdate}
                    entry={this.state.text}
                    placeholder={`${this.props.language.name} Translation`}
                    autocomplete={true}
                    focus={true}
                    textarea={true}
                />
            </Dialog>
        );
    }

    public render(): JSX.Element {
        if (this.props.translating) {
            return this.renderTranslate();
        } else {
            return this.renderEdit();
        }
    }
}
