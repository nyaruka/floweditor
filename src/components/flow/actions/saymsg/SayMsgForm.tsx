import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { hasErrors } from '~/components/flow/actions/helpers';
import { ActionFormProps } from '~/components/flow/props';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import UploadButton from '~/components/uploadbutton/UploadButton';
import { fakePropType } from '~/config/ConfigProvider';
import { FormState, mergeForm, StringEntry, ValidationFailure } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

import { initializeForm, stateToAction } from './helpers';

export interface SayMsgFormState extends FormState {
    message: StringEntry;
    audio: StringEntry;
}

export default class SayMsgForm extends React.Component<ActionFormProps, SayMsgFormState> {
    constructor(props: ActionFormProps) {
        super(props);
        this.state = initializeForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public static contextTypes = {
        endpoints: fakePropType
    };

    private handleUpdate(keys: { text?: string }): boolean {
        const updates: Partial<SayMsgFormState> = {};

        if (keys.hasOwnProperty('text')) {
            updates.message = validate('Message', keys.text, [validateRequired]);
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    public handleMessageUpdate(text: string): boolean {
        return this.handleUpdate({ text });
    }

    private handleSave(): void {
        // make sure we validate untouched text fields
        const valid = this.handleUpdate({
            text: this.state.message.value
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

    private handleUploadChanged(url: string): void {
        this.setState({ audio: { value: url } });
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
                <TextInputElement
                    name="Message"
                    showLabel={false}
                    onChange={this.handleMessageUpdate}
                    entry={this.state.message}
                    onFieldFailures={(persistantFailures: ValidationFailure[]) => {
                        const message = { ...this.state.message, persistantFailures };
                        this.setState({ message, valid: this.state.valid && !hasErrors(message) });
                    }}
                    autocomplete={true}
                    focus={true}
                    textarea={true}
                />

                <UploadButton
                    icon="fe-mic"
                    uploadText="Upload Recording"
                    removeText="Remove Recording"
                    url={this.state.audio.value}
                    endpoint={this.context.endpoints.attachments}
                    onUploadChanged={this.handleUploadChanged}
                />
            </Dialog>
        );
    }
}
