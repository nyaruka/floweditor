import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Type } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { BroadcastMsg } from '../../../flowTypes';
import { Asset } from '../../../services/AssetService';
import Localization, { LocalizedObject } from '../../../services/Localization';
import { AppState, DispatchWithState } from '../../../store';
import { SendBroadcastFunc, updateSendBroadcastForm } from '../../../store/forms';
import { FormEntry, SendBroadcastFormState } from '../../../store/nodeEditor';
import { validate, validateRequired } from '../../../store/validators';
import * as styles from '../../actions/Action/Action.scss';
import OmniboxElement from '../../form/OmniboxElement';
import TextInputElement, { Count } from '../../form/TextInputElement';
import { Language } from '../../LanguageSelector';
import { UpdateLocalizations } from '../../NodeEditor';
import * as broadcastStyles from './SendBroadcast.scss';
import { SendBroadcastFormHelper } from './SendBroadcastFormHelper';

export interface SendBroadcastFormStoreProps {
    language: Language;
    translating: boolean;
    typeConfig: Type;
    localizations: LocalizedObject[];
    form: SendBroadcastFormState;
    updateSendBroadcastForm: SendBroadcastFunc;
}

export interface SendBroadcastFormPassedProps {
    action: BroadcastMsg;
    formHelper: SendBroadcastFormHelper;
    updateAction(action: BroadcastMsg): void;
    updateLocalizations: UpdateLocalizations;
}

export type SendBroadcastFormProps = SendBroadcastFormStoreProps & SendBroadcastFormPassedProps;

// Note: action prop is only used for its uuid (see onValid)
export class SendBroadcastForm extends React.Component<
    SendBroadcastFormProps,
    SendBroadcastFormState
> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: SendBroadcastFormProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public onValid(): void {
        // TODO: might be nice to generalize translatable forms into helpers?
        if (this.props.translating) {
            const translation = this.props.form.text.value;

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
            const action = this.props.formHelper.stateToAction(
                this.props.action.uuid,
                this.props.form
            );
            this.props.updateAction(action);
        }
    }

    public handleRecipientsChanged(selected: Asset[]): void {
        this.props.updateSendBroadcastForm({
            recipients: validate('Recipients', selected, [validateRequired])
        });
    }

    public handleMessageUpdate(value: string): void {
        const validators = [];
        if (!this.props.translating) {
            validators.push(validateRequired);
        }

        this.props.updateSendBroadcastForm({ text: validate('Message', value, validators) });
    }

    public render(): JSX.Element {
        let placeholder = '';
        let translation = null;
        let recipients = null;

        const message: FormEntry = this.props.form.text;

        if (this.props.translating) {
            const { text: textToTrans } = this.props.form;

            translation = (
                <div data-spec="translation-container">
                    <div data-spec="text-to-translate" className={styles.translate_from}>
                        {textToTrans}
                    </div>
                </div>
            );

            placeholder = `${this.props.language.name} Translation`;

            if (this.props.localizations[0].isLocalized()) {
                message.value = (this.props.localizations[0].getObject() as BroadcastMsg).text;
            }
        } else {
            recipients = (
                <OmniboxElement
                    data-spec="recipients"
                    className={broadcastStyles.recipients}
                    name="Recipients"
                    assets={this.context.assetService.getRecipients()}
                    entry={this.props.form.recipients}
                    add={true}
                    onChange={this.handleRecipientsChanged}
                />
            );
        }

        return (
            <div>
                {translation}
                {recipients}
                <TextInputElement
                    name="Message"
                    showLabel={false}
                    count={Count.SMS}
                    entry={message}
                    placeholder={placeholder}
                    autocomplete={true}
                    onChange={this.handleMessageUpdate}
                    focus={true}
                    textarea={true}
                />
            </div>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: { localizations },
    flowEditor: { editorUI: { language, translating } },
    nodeEditor: { typeConfig, form }
}: AppState) => ({
    language,
    translating,
    typeConfig,
    localizations,
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateSendBroadcastForm }, dispatch);

const ConnectedSendBroadcastForm = connect(mapStateToProps, mapDispatchToProps, null, {
    withRef: true
})(SendBroadcastForm);

export default ConnectedSendBroadcastForm;
