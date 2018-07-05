import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as styles from '~/component/actions/Action/Action.scss';
import CheckboxElement from '~/component/form/CheckboxElement';
import TaggingElement from '~/component/form/TaggingElement/TaggingElement';
import TextInputElement, { Count } from '~/component/form/TextInputElement';
import { UpdateLocalizations } from '~/component/NodeEditor';
import { Type } from '~/config';
import { FlowDefinition, SendMsg } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { AppState, DispatchWithState } from '~/store';
import { SendMsgFunc, updateSendMsgForm } from '~/store/forms';
import { SendMsgFormState } from '~/store/nodeEditor';
import { validate, validateMaxOfTen, validateRequired } from '~/store/validators';

import * as localStyles from './SendMsgForm.scss';
import { SendMsgFormHelper } from './SendMsgFormHelper';

const MAX_REPLIES = 10;

export interface SendMsgFormStoreProps {
    language: Asset;
    translating: boolean;
    typeConfig: Type;
    definition: FlowDefinition;
    updateSendMsgForm: SendMsgFunc;
    form: SendMsgFormState;
}

export interface SendMsgFormPassedProps {
    showAdvanced: boolean;
    action: SendMsg;
    updateAction(action: SendMsg): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    formHelper: SendMsgFormHelper;
    updateLocalizations: UpdateLocalizations;
}

export type SendMsgFormProps = SendMsgFormStoreProps & SendMsgFormPassedProps;

export class SendMsgForm extends React.Component<SendMsgFormProps> {
    constructor(props: SendMsgFormProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^handle/, /^on/]
        });
    }

    public onValid(): void {
        if (this.props.translating) {
            const translation = this.props.form.text ? this.props.form.text.value : null;

            if (translation) {
                this.props.updateLocalizations(this.props.language.id, [
                    { uuid: this.props.action.uuid, translations: { text: translation } }
                ]);
            } else {
                this.props.updateLocalizations(this.props.language.id, [
                    { uuid: this.props.action.uuid, translations: null }
                ]);
            }
        } else {
            this.props.updateAction(
                this.props.formHelper.stateToAction(this.props.action.uuid, this.props.form)
            );
        }
    }

    public validate(): boolean {
        return this.handleUpdateMessage(this.props.form.text.value);
    }

    private handleUpdateForm(updates: Partial<SendMsgFormState>): boolean {
        return (this.props.updateSendMsgForm(updates) as any).valid;
    }

    public handleUpdateMessage(value: string): boolean {
        const validators = [];
        if (!this.props.translating) {
            validators.push(validateRequired);
        }

        return this.handleUpdateForm({
            text: validate('Message', value, validators)
        });
    }

    public handleUpdateQuickReplies(value: string[]): boolean {
        return this.handleUpdateForm({
            quickReplies: validate('Quick Replies', value, [validateMaxOfTen])
        });
    }

    public handleUpdateSendAll(sendAll: boolean): void {
        this.props.updateSendMsgForm({ sendAll });
    }

    public handleCheckValidReply(value: string): boolean {
        return true;
    }

    public handleValidReplyPrompt(value: string): string {
        return `New Reply "${value}"`;
    }

    private renderForm(): JSX.Element {
        let placeholder = '';
        let translation = null;

        if (this.props.translating) {
            translation = (
                <div data-spec="translation-container">
                    <div data-spec="text-to-translate" className={styles.translate_from}>
                        {this.props.action.text}
                    </div>
                </div>
            );
            placeholder = `${this.props.language.name} Translation`;
        }

        return (
            <div>
                {translation}
                <TextInputElement
                    name="Message"
                    showLabel={false}
                    count={Count.SMS}
                    onChange={this.handleUpdateMessage}
                    entry={this.props.form.text}
                    placeholder={placeholder}
                    autocomplete={true}
                    focus={true}
                    textarea={true}
                />
            </div>
        );
    }

    private renderAdvanced(): JSX.Element {
        if (this.props.translating) {
            return (
                <>
                    <p>Enter any {this.props.language.name} Quick Replies</p>
                    <TaggingElement
                        name="Replies"
                        placeholder="Quick Replies"
                        prompt="Enter a Quick Reply"
                        onChange={this.handleUpdateQuickReplies}
                        onCheckValid={this.handleCheckValidReply}
                        onValidPrompt={this.handleValidReplyPrompt}
                        entry={this.props.form.quickReplies}
                    />
                </>
            );
        }

        return (
            <>
                <p>Quick Replies are made into buttons for supported channels</p>
                <TaggingElement
                    name="Replies"
                    placeholder="Quick Replies"
                    prompt="Enter a Quick Reply"
                    onChange={this.handleUpdateQuickReplies}
                    onCheckValid={this.handleCheckValidReply}
                    onValidPrompt={this.handleValidReplyPrompt}
                    entry={this.props.form.quickReplies}
                />
                <CheckboxElement
                    name="All Destinations"
                    title="All Destinations"
                    labelClassName={localStyles.checkbox}
                    checked={this.props.form.sendAll}
                    description="Send a message to all destinations known for this contact."
                    onChange={this.handleUpdateSendAll}
                />
            </>
        );
    }

    public render(): JSX.Element {
        return this.props.showAdvanced ? this.renderAdvanced() : this.renderForm();
    }
}

const mapStateToProps = ({
    flowContext: { definition },
    flowEditor: {
        editorUI: { language, translating }
    },
    nodeEditor: { typeConfig, form }
}: AppState) => ({
    language,
    translating,
    typeConfig,
    definition,
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateSendMsgForm }, dispatch);

const ConnectedSendMsgForm = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: true }
)(SendMsgForm);

export default ConnectedSendMsgForm;
