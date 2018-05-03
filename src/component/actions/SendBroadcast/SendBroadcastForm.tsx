import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { connect } from 'react-redux';
import { Type } from '../../../config';
import { FlowDefinition, BroadcastMsg, Group, Contact } from '../../../flowTypes';
import { AppState } from '../../../store';
import Localization, { LocalizedObject } from '../../../services/Localization';

import CheckboxElement from '../../form/CheckboxElement';
import TextInputElement, { Count } from '../../form/TextInputElement';
import { Language } from '../../LanguageSelector';
import { UpdateLocalizations } from '../../NodeEditor';
import OmniboxElement from '../../form/OmniboxElement';
import { fakePropType } from '../../../config/ConfigProvider';

import * as styles from '../../actions/Action/Action.scss';
import * as broadcastStyles from './SendBroadcast.scss';
import { Asset, AssetType } from '../../../services/AssetService';

export interface SendBroadcastFormStoreProps {
    language: Language;
    translating: boolean;
    typeConfig: Type;
    definition: FlowDefinition;
    localizations: LocalizedObject[];
}

export interface SendBroadcastFormPassedProps {
    showAdvanced: boolean;
    action: BroadcastMsg;
    updateAction(action: BroadcastMsg): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateLocalizations: UpdateLocalizations;
}

interface SendBroadcastFormState {
    selected: Asset[];
}

export type SendBroadcastFormProps = SendBroadcastFormStoreProps & SendBroadcastFormPassedProps;

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

        this.state = {
            selected: this.getSelected()
        };

        bindCallbacks(this, {
            include: [/^on/]
        });
    }

    private getSelected(): Asset[] {
        const selected = (this.props.action.groups || []).map((group: Group) => {
            return { id: group.uuid, name: group.name, type: AssetType.Group };
        });

        return selected.concat(
            (this.props.action.contacts || []).map((contact: Contact) => {
                return { id: contact.uuid, name: contact.name, type: AssetType.Contact };
            })
        );
    }

    private getAssetType(assets: Asset[], type: AssetType): any[] {
        return this.state.selected
            .filter((asset: Asset) => asset.type === type)
            .map((asset: Asset) => {
                return { uuid: asset.id, name: asset.name };
            });
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
            const groups: Group[] = this.getAssetType(this.state.selected, AssetType.Group);
            const contacts: Contact[] = this.getAssetType(this.state.selected, AssetType.Contact);
            const newAction: BroadcastMsg = {
                uuid: this.props.action.uuid,
                type: this.props.typeConfig.type,
                text: value,
                groups,
                contacts
            };
            this.props.updateAction(newAction);
        }
    }

    private onRecipientsChanged(selected: Asset[]): void {
        this.setState({ selected });
    }

    private renderForm(): JSX.Element {
        let text = '';
        let placeholder = '';
        let translation = null;
        let recipients = null;

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
                ({ text } = this.props.localizations[0].getObject() as BroadcastMsg);
            }
        } else {
            ({ text } = this.props.action);

            recipients = (
                <OmniboxElement
                    ref={this.props.onBindWidget}
                    className={broadcastStyles.recipients}
                    name="Groups"
                    assets={this.context.assetService.getRecipients()}
                    selected={this.state.selected}
                    add={true}
                    required={true}
                    onChange={this.onRecipientsChanged}
                />
            );
        }

        return (
            <div>
                {translation}
                {recipients}
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
        return null;
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

const ConnectedSendMsgForm = connect(mapStateToProps, null, null, { withRef: true })(
    SendBroadcastForm
);

export default ConnectedSendMsgForm;
