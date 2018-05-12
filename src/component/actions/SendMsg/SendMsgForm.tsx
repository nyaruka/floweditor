import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Type } from '../../../config';
import { FlowDefinition, SendMsg } from '../../../flowTypes';
import Localization, { LocalizedObject } from '../../../services/Localization';
import { AppState, DispatchWithState } from '../../../store';
import { SendMsgFunc, updateSendMsgForm } from '../../../store/forms';
import { FormEntry, SendMsgFormState } from '../../../store/nodeEditor';
import { validate, validateMaxOfTen, validateRequired } from '../../../store/validators';
import * as styles from '../../actions/Action/Action.scss';
import CheckboxElement from '../../form/CheckboxElement';
import TaggingElement from '../../form/TaggingElement/TaggingElement';
import TextInputElement, { Count } from '../../form/TextInputElement';
import { Language } from '../../LanguageSelector';
import { UpdateLocalizations } from '../../NodeEditor';
import { SendMsgFormHelper } from './SendMsgFormHelper';

const MAX_REPLIES = 10;

export interface SendMsgFormStoreProps {
    language: Language;
    translating: boolean;
    typeConfig: Type;
    definition: FlowDefinition;
    localizations: LocalizedObject[];
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
            const translation = this.props.form.text;

            if (translation) {
                this.props.updateLocalizations(this.props.language.iso, [
                    { uuid: this.props.action.uuid, translations: { text: [translation] } }
                ]);
            } else {
                this.props.updateLocalizations(this.props.language.iso, [
                    { uuid: this.props.action.uuid, translations: null }
                ]);
            }
        } else {
            this.props.updateAction(
                this.props.formHelper.stateToAction(this.props.action.uuid, this.props.form)
            );
        }
    }

    private renderForm(): JSX.Element {
        let placeholder = '';
        let translation = null;

        let entry = this.props.form.text;

        if (this.props.translating) {
            translation = (
                <div data-spec="translation-container">
                    <div data-spec="text-to-translate" className={styles.translate_from}>
                        {this.props.action.text}
                    </div>
                </div>
            );

            placeholder = `${this.props.language.name} Translation`;

            if (this.props.localizations[0].isLocalized()) {
                entry = { value: (this.props.localizations[0].getObject() as SendMsg).text };
            }
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

    public handleUpdateMessage(value: string): void {
        this.props.updateSendMsgForm({
            text: validate('Message', value, [validateRequired])
        });
    }

    public handleUpdateQuickReplies(value: string[]): void {
        this.props.updateSendMsgForm({
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

    private renderAdvanced(): JSX.Element {
        if (this.props.translating) {
            const translatedQR: FormEntry = {
                value: (this.props.localizations[0].getObject() as SendMsg).quick_replies
            };
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
                        entry={{ value: translatedQR }}
                    />
                </>
            );
        }

        return (
            <div>
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
                    defaultValue={this.props.form.sendAll}
                    description="Send a message to all destinations known for this contact."
                    onChange={this.handleUpdateSendAll}
                />
            </div>
        );
    }

    public render(): JSX.Element {
        return this.props.showAdvanced ? this.renderAdvanced() : this.renderForm();
    }
}

const mapStateToProps = ({
    flowContext: { definition, localizations },
    flowEditor: { editorUI: { language, translating } },
    nodeEditor: { typeConfig, form }
}: AppState) => ({
    language,
    translating,
    typeConfig,
    definition,
    localizations,
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateSendMsgForm }, dispatch);

const ConnectedSendMsgForm = connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(
    SendMsgForm
);

export default ConnectedSendMsgForm;
