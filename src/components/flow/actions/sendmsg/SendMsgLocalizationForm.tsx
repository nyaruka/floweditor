import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet, HeaderStyle } from '~/components/dialog/Dialog';
import Flipper from '~/components/flipper/Flipper';
import * as styles from '~/components/flow/actions/action/Action.scss';
import { initializeLocalizedForm } from '~/components/flow/actions/sendmsg/helpers';
import { SendMsgFormState } from '~/components/flow/actions/sendmsg/SendMsgForm';
import TaggingElement from '~/components/form/select/tags/TaggingElement';
import TextInputElement, { Count } from '~/components/form/textinput/TextInputElement';
import { UpdateLocalizations } from '~/components/nodeeditor/NodeEditor';
import { Type } from '~/config/typeConfigs';
import { SendMsg } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { mergeForm, NodeEditorSettings } from '~/store/nodeEditor';
import { validate, validateMaxOfTen } from '~/store/validators';

export interface SendMsgLocalizationFormProps {
    language: Asset;
    nodeSettings: NodeEditorSettings;
    typeConfig: Type;
    updateLocalizations(languageCode: string, localizations: any[]): UpdateLocalizations;
    onClose(canceled: boolean): void;
}

export default class SendMsgLocalizationForm extends React.Component<
    SendMsgLocalizationFormProps,
    SendMsgFormState
> {
    constructor(props: SendMsgLocalizationFormProps) {
        super(props);
        this.state = initializeLocalizedForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^handle/, /^on/]
        });
    }

    public handleMessageUpdate(text: string): boolean {
        return this.handleUpdate({ text });
    }

    private handleUpdate(keys: {
        text?: string;
        sendAll?: boolean;
        quickReplies?: string[];
    }): boolean {
        const updates: Partial<SendMsgFormState> = {};

        if (keys.hasOwnProperty('text')) {
            updates.text = validate('Message', keys.text, []);
        }

        if (keys.hasOwnProperty('quickReplies')) {
            updates.quickReplies = validate('Quick Replies', keys.quickReplies, [validateMaxOfTen]);
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    public handleQuickRepliesUpdate(quickReplies: string[]): boolean {
        return this.handleUpdate({ quickReplies });
    }

    private handleSave(): void {
        const { text, quickReplies } = this.state;

        this.props.updateLocalizations(this.props.language.id, [
            {
                uuid: this.props.nodeSettings.originalAction.uuid,
                translations: {
                    text: text.value,
                    quick_replies: quickReplies.value
                }
            }
        ]);

        // notify our modal we are done
        this.props.onClose(false);
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public render(): JSX.Element {
        return (
            <Flipper
                front={
                    <Dialog
                        title={this.props.typeConfig.name}
                        headerClass={this.props.typeConfig.type}
                        buttons={this.getButtons()}
                    >
                        <div data-spec="translation-container">
                            <div data-spec="text-to-translate" className={styles.translate_from}>
                                {(this.props.nodeSettings.originalAction as SendMsg).text}
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
                }
                back={
                    <Dialog
                        title={this.props.typeConfig.name}
                        subtitle="Advanced Settings"
                        headerStyle={HeaderStyle.BARBER}
                        headerClass={this.props.typeConfig.type}
                        headerIcon="fe-cog"
                    >
                        <p>Enter any {this.props.language.name} Quick Replies</p>
                        <TaggingElement
                            name="Replies"
                            placeholder="Quick Replies"
                            prompt="Enter a Quick Reply"
                            onChange={this.handleQuickRepliesUpdate}
                            onCheckValid={() => true}
                            onValidPrompt={(value: string) => `New Reply "${value}"`}
                            entry={this.state.quickReplies}
                        />
                    </Dialog>
                }
            />
        );
    }
}
