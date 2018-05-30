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
import { SendBroadcastFormState } from '../../../store/nodeEditor';
import { validate, validateRequired } from '../../../store/validators';
import * as styles from '../../actions/Action/Action.scss';
import OmniboxElement from '../../form/OmniboxElement';
import TextInputElement, { Count } from '../../form/TextInputElement';
import { UpdateLocalizations } from '../../NodeEditor';
import * as broadcastStyles from './SendBroadcast.scss';
import { SendBroadcastFormHelper } from './SendBroadcastFormHelper';

export interface SendBroadcastFormStoreProps {
    language: Asset;
    translating: boolean;
    typeConfig: Type;
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
                this.props.updateLocalizations(this.props.language.id, [
                    { uuid: this.props.action.uuid, translations: { text: [translation] } }
                ]);
            } else {
                this.props.updateLocalizations(this.props.language.id, [
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

    public validate(): boolean {
        const valid = this.handleRecipientsChanged(this.props.form.recipients.value);
        return this.handleMessageUpdate(this.props.form.text.value) && valid;
    }

    private handleUpdateForm(updates: Partial<SendBroadcastFormState>): boolean {
        return (this.props.updateSendBroadcastForm(updates) as any).valid;
    }

    public handleRecipientsChanged(selected: Asset[]): boolean {
        return this.handleUpdateForm({
            recipients: validate('Recipients', selected, [validateRequired])
        });
    }

    public handleMessageUpdate(value: string): boolean {
        const validators = [];
        if (!this.props.translating) {
            validators.push(validateRequired);
        }

        return this.handleUpdateForm({ text: validate('Message', value, validators) });
    }

    public render(): JSX.Element {
        let placeholder = '';
        let translation = null;
        let recipients = null;

        if (this.props.translating) {
            const textToTrans = this.props.action.text;

            translation = (
                <div data-spec="translation-container">
                    <div data-spec="text-to-translate" className={styles.translate_from}>
                        {textToTrans}
                    </div>
                </div>
            );

            placeholder = `${this.props.language.name} Translation`;
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
                    entry={this.props.form.text}
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
    flowEditor: { editorUI: { language, translating } },
    nodeEditor: { typeConfig, form }
}: AppState) => ({
    language,
    translating,
    typeConfig,
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateSendBroadcastForm }, dispatch);

const ConnectedSendBroadcastForm = connect(mapStateToProps, mapDispatchToProps, null, {
    withRef: true
})(SendBroadcastForm);

export default ConnectedSendBroadcastForm;
