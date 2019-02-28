import { react as bindCallbacks } from 'auto-bind';
import axios from 'axios';
import * as React from 'react';
import Button, { ButtonTypes } from '~/components/button/Button';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { ActionFormProps } from '~/components/flow/props';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { getCookie } from '~/external';
import { FormState, mergeForm, StringEntry } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';

import { initializeForm, stateToAction } from './helpers';

export interface SayMsgFormState extends FormState {
    text: StringEntry;
    audio: StringEntry;
}

export default class SayMsgForm extends React.Component<ActionFormProps, SayMsgFormState> {
    private filePicker: any;

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
            updates.text = validate('Message', keys.text, [validateRequired]);
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
            text: this.state.text.value
        });

        if (valid) {
            this.props.updateAction(stateToAction(this.props.nodeSettings, this.state));

            // notify our modal we are done
            this.props.onClose(false);
        }
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave, disabled: !this.state.valid },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    private handleRemoveRecording(): void {
        this.setState({ audio: { value: null } });
    }

    private handleUploadRecording(files: FileList): void {
        const data = new FormData();
        data.append('file', files[0]);

        // if we have a csrf in our cookie, pass it along as a header
        const csrf = getCookie('csrftoken');
        const headers = csrf ? { 'X-CSRFToken': csrf } : {};

        axios
            .post(this.context.endpoints.attachments, data, { headers })
            .then(response => {
                this.setState({ audio: { value: response.data.url } });
            })
            .catch(error => {
                console.log(error);
            });
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
                    entry={this.state.text}
                    autocomplete={true}
                    focus={true}
                    textarea={true}
                />

                <input
                    style={{
                        display: 'none'
                    }}
                    ref={ele => {
                        this.filePicker = ele;
                    }}
                    type="file"
                    onChange={e => this.handleUploadRecording(e.target.files)}
                />

                {this.state.audio.value ? (
                    <Button
                        iconName="fe-trash"
                        name="Remove Recording"
                        topSpacing={true}
                        onClick={this.handleRemoveRecording}
                        type={ButtonTypes.tertiary}
                    />
                ) : (
                    <Button
                        iconName="fe-mic"
                        name="Upload Recording"
                        topSpacing={true}
                        onClick={() => {
                            this.filePicker.click();
                        }}
                        type={ButtonTypes.tertiary}
                    />
                )}
            </Dialog>
        );
    }
}
