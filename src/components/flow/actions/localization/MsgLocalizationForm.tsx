import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet, Tab } from '~/components/dialog/Dialog';
import * as styles from '~/components/flow/actions/action/Action.scss';
import { initializeLocalizedForm } from '~/components/flow/actions/sendmsg/helpers';
import { SendMsgFormState } from '~/components/flow/actions/sendmsg/SendMsgForm';
import { determineTypeConfig } from '~/components/flow/helpers';
import { LocalizationFormProps } from '~/components/flow/props';
import TaggingElement from '~/components/form/select/tags/TaggingElement';
import TextInputElement, { Count } from '~/components/form/textinput/TextInputElement';
import { SendMsg } from '~/flowTypes';
import { FormState, mergeForm, StringArrayEntry, StringEntry } from '~/store/nodeEditor';
import { validate, validateMaxOfTen } from '~/store/validators';

export interface MsgLocalizationFormState extends FormState {
    text: StringEntry;
    quickReplies: StringArrayEntry;
}

export default class MsgLocalizationForm extends React.Component<
    LocalizationFormProps,
    MsgLocalizationFormState
> {
    constructor(props: LocalizationFormProps) {
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
            primary: { name: 'Ok', onClick: this.handleSave, disabled: !this.state.valid },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public render(): JSX.Element {
        const typeConfig = determineTypeConfig(this.props.nodeSettings);
        const tabs: Tab[] = [];

        if (typeConfig.localizeableKeys.indexOf('quick_replies') > -1) {
            tabs.push({
                name: 'Quick Replies',
                body: (
                    <>
                        <p>{this.props.language.name} Quick Replies</p>
                        <TaggingElement
                            name="Replies"
                            placeholder="Quick Replies"
                            prompt="Enter a Quick Reply"
                            onChange={this.handleQuickRepliesUpdate}
                            onCheckValid={() => true}
                            entry={this.state.quickReplies}
                        />
                    </>
                )
            });
        }

        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                buttons={this.getButtons()}
                tabs={tabs}
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
        );
    }
}
