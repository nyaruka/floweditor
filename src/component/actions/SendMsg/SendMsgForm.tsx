import * as React from 'react';
import { connect } from 'react-redux';
import { Type } from '../../../config';
import { FlowDefinition, SendMsg } from '../../../flowTypes';
import { AppState } from '../../../store';
import Localization, { LocalizedObject } from '../../../services/Localization';
import * as styles from '../../actions/Action/Action.scss';
import CheckboxElement from '../../form/CheckboxElement';
import TextInputElement, { Count } from '../../form/TextInputElement';
import { Language } from '../../LanguageSelector';
import { UpdateLocalizations } from '../../NodeEditor';

export interface SendMsgFormStoreProps {
    language: Language;
    translating: boolean;
    typeConfig: Type;
    definition: FlowDefinition;
    localizations: LocalizedObject[];
}

export interface SendMsgFormPassedProps {
    showAdvanced: boolean;
    action: SendMsg;
    updateAction(action: SendMsg): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateLocalizations: UpdateLocalizations;
}

export type SendMsgFormProps = SendMsgFormStoreProps & SendMsgFormPassedProps;

export class SendMsgForm extends React.Component<SendMsgFormProps> {
    constructor(props: SendMsgFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { wrappedInstance: { state: { value } } } = widgets.Message;
        const sendAll = widgets['All Destinations'];

        if (this.props.translating) {
            const translation = value.trim();

            if (translation) {
                this.props.updateLocalizations(this.props.language.iso, [
                    { uuid: this.props.action.uuid, translations: { text: [value] } }
                ]);
            } else {
                this.props.updateLocalizations(this.props.language.iso, [
                    { uuid: this.props.action.uuid, translations: null }
                ]);
            }
        } else {
            const newAction: SendMsg = {
                uuid: this.props.action.uuid,
                type: this.props.typeConfig.type,
                text: value
            };

            if (sendAll.state.checked) {
                newAction.all_urns = true;
            }

            this.props.updateAction(newAction);
        }
    }

    private renderForm(): JSX.Element {
        let text = '';
        let placeholder = '';
        let translation = null;

        if (this.props.translating) {
            const { text: textToTrans } = this.props.action;

            translation = (
                <div data-spec="translation-container">
                    <div data-spec="text-to-translate" className={styles.translate_from}>
                        {textToTrans}
                    </div>
                </div>
            );

            placeholder = `${this.props.language.name} Translation`;

            if (this.props.localizations[0].isLocalized()) {
                ({ text } = this.props.localizations[0].getObject() as SendMsg);
            }
        } else {
            ({ text } = this.props.action);
        }

        return (
            <div>
                {translation}
                <TextInputElement
                    ref={this.props.onBindWidget}
                    name="Message"
                    showLabel={false}
                    count={Count.SMS}
                    value={text}
                    placeholder={placeholder}
                    autocomplete={true}
                    focus={true}
                    required={!this.props.translating}
                    textarea={true}
                />
            </div>
        );
    }

    private renderAdvanced(): JSX.Element {
        return (
            <CheckboxElement
                ref={this.props.onBindAdvancedWidget}
                name="All Destinations"
                defaultValue={this.props.action.all_urns}
                description="Send a message to all destinations known for this contact."
            />
        );
    }

    public render(): JSX.Element {
        return this.props.showAdvanced ? this.renderAdvanced() : this.renderForm();
    }
}

const mapStateToProps = ({
    flowContext: { definition, localizations },
    flowEditor: { editorUI: { language, translating } },
    nodeEditor: { typeConfig }
}: AppState) => ({
    language,
    translating,
    typeConfig,
    definition,
    localizations
});

const ConnectedSendMsgForm = connect(mapStateToProps, null, null, { withRef: true })(SendMsgForm);

export default ConnectedSendMsgForm;
