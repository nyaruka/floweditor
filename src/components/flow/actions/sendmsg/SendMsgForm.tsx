import { react as bindCallbacks } from 'auto-bind';
import axios from 'axios';
import mutate from 'immutability-helper';
import * as React from 'react';
import Dialog, { ButtonSet, Tab } from '~/components/dialog/Dialog';
import { initializeForm, stateToAction } from '~/components/flow/actions/sendmsg/helpers';
import * as localStyles from '~/components/flow/actions/sendmsg/SendMsgForm.scss';
import { ActionFormProps } from '~/components/flow/props';
import CheckboxElement from '~/components/form/checkbox/CheckboxElement';
import SelectElement, { SelectOption } from '~/components/form/select/SelectElement';
import TaggingElement from '~/components/form/select/tags/TaggingElement';
import TextInputElement, { Count } from '~/components/form/textinput/TextInputElement';
import TypeList from '~/components/nodeeditor/TypeList';
import Pill from '~/components/pill/Pill';
import { fakePropType } from '~/config/ConfigProvider';
import { FormState, mergeForm, StringArrayEntry, StringEntry } from '~/store/nodeEditor';
import { validate, validateMaxOfTen, validateRequired } from '~/store/validators';
import { createUUID } from '~/utils';
import { small } from '~/utils/reactselect';

import * as styles from './SendMsgForm.scss';

const MAX_ATTACHMENTS = 5;

const TYPE_OPTIONS: SelectOption[] = [
    { value: 'image', label: 'Image URL' },
    { value: 'audio', label: 'Audio URL' },
    { value: 'video', label: 'Video URL' }
];

const NEW_TYPE_OPTIONS = TYPE_OPTIONS.concat([{ value: 'upload', label: 'Upload Attachment' }]);

const getAttachmentTypeOption = (type: string): SelectOption => {
    return TYPE_OPTIONS.find((option: SelectOption) => option.value === type);
};

export interface Attachment {
    type: string;
    url: string;
    uploaded?: boolean;
}

export interface SendMsgFormState extends FormState {
    text: StringEntry;
    quickReplies: StringArrayEntry;
    sendAll: boolean;
    attachments: Attachment[];
}

export default class SendMsgForm extends React.Component<ActionFormProps, SendMsgFormState> {
    private filePicker: any;

    constructor(props: ActionFormProps) {
        super(props);
        this.state = initializeForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^handle/, /^on/]
        });
    }

    public static contextTypes = {
        endpoints: fakePropType
    };

    private handleUpdate(keys: {
        text?: string;
        sendAll?: boolean;
        quickReplies?: string[];
    }): boolean {
        const updates: Partial<SendMsgFormState> = {};

        if (keys.hasOwnProperty('text')) {
            updates.text = validate('Message', keys.text, [validateRequired]);
        }

        if (keys.hasOwnProperty('sendAll')) {
            updates.sendAll = keys.sendAll;
        }

        if (keys.hasOwnProperty('quickReplies')) {
            updates.quickReplies = validate('Quick Replies', keys.quickReplies, [validateMaxOfTen]);
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    public handleMessageUpdate(text: string): boolean {
        return this.handleUpdate({ text });
    }

    public handleQuickRepliesUpdate(quickReplies: string[]): boolean {
        return this.handleUpdate({ quickReplies });
    }

    public handleSendAllUpdate(sendAll: boolean): boolean {
        return this.handleUpdate({ sendAll });
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

    public handleAttachmentRemoved(index: number): void {
        // we found a match, merge us in
        const updated: any = mutate(this.state.attachments, {
            $splice: [[index, 1]]
        });
        this.setState({ attachments: updated });
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    private renderUpload(index: number, attachment: Attachment): JSX.Element {
        return (
            <div
                className={styles.urlAttachment}
                key={index > -1 ? 'url_attachment_' + index : createUUID()}
            >
                <div className={styles.typeChoice}>
                    <SelectElement
                        name="Type"
                        styles={small}
                        entry={{
                            value: { label: attachment.type }
                        }}
                        options={TYPE_OPTIONS}
                    />
                </div>
                <div className={styles.url}>
                    <span className={styles.upload}>
                        <Pill
                            icon="fe-download"
                            text=" Download"
                            large={true}
                            onClick={() => {
                                window.open(attachment.url, '_blank');
                            }}
                        />
                        <div className={styles.removeUpload}>
                            <Pill
                                icon="fe-x"
                                text=" Remove"
                                large={true}
                                onClick={() => {
                                    this.handleAttachmentRemoved(index);
                                }}
                            />
                        </div>
                    </span>
                </div>
            </div>
        );
    }

    private handleUploadFile(files: FileList): void {
        let attachments: any = this.state.attachments;

        const data = new FormData();
        data.append('file', files[0]);
        axios
            .post(this.context.endpoints.attachments, data)
            .then(response => {
                attachments = mutate(attachments, {
                    $push: [{ type: response.data.type, url: response.data.url, uploaded: true }]
                });
                this.setState({ attachments });
            })
            .catch(error => {
                console.log(error);
            });
    }

    private renderAttachment(index: number, attachment: Attachment): JSX.Element {
        let attachments: any = this.state.attachments;
        return (
            <div
                className={styles.urlAttachment}
                key={index > -1 ? 'url_attachment_' + index : createUUID()}
            >
                <div className={styles.typeChoice}>
                    <SelectElement
                        styles={small}
                        name="Type Options"
                        placeholder="Add Attachment"
                        entry={{
                            value: index > -1 ? getAttachmentTypeOption(attachment.type) : null
                        }}
                        onChange={(option: any) => {
                            if (option.value === 'upload') {
                                window.setTimeout(() => {
                                    this.filePicker.click();
                                }, 200);
                            } else {
                                if (index === -1) {
                                    attachments = mutate(attachments, {
                                        $push: [{ type: option.value, url: '' }]
                                    });
                                } else {
                                    attachments = mutate(attachments, {
                                        [index]: {
                                            $set: { type: option.value, url: attachment.url }
                                        }
                                    });
                                }
                                this.setState({ attachments });
                            }
                        }}
                        options={index > -1 ? TYPE_OPTIONS : NEW_TYPE_OPTIONS}
                    />
                </div>
                {index > -1 ? (
                    <>
                        <div className={styles.url}>
                            <TextInputElement
                                placeholder="URL"
                                name="url"
                                onChange={(value: string) => {
                                    attachments = mutate(attachments, {
                                        [index]: { $set: { type: attachment.type, url: value } }
                                    });
                                    this.setState({ attachments });
                                }}
                                entry={{ value: attachment.url }}
                                autocomplete={true}
                            />
                        </div>
                        <div className={styles.remove}>
                            <Pill
                                icon="fe-x"
                                text=" Remove"
                                large={true}
                                onClick={() => {
                                    this.handleAttachmentRemoved(index);
                                }}
                            />
                        </div>
                    </>
                ) : null}
            </div>
        );
    }

    private renderAttachments(): JSX.Element {
        const attachments = this.state.attachments.map(
            (attachment, index: number) =>
                attachment.uploaded
                    ? this.renderUpload(index, attachment)
                    : this.renderAttachment(index, attachment)
        );

        const emptyOption =
            this.state.attachments.length < MAX_ATTACHMENTS
                ? this.renderAttachment(-1, { url: '', type: '' })
                : null;
        return (
            <>
                <p>
                    Add up to {MAX_ATTACHMENTS} to each message. Each attachment can be a file you
                    upload or a dynamic URL using expressions and variables from your Flow.
                </p>
                {attachments}
                {emptyOption}
                <input
                    style={{
                        display: 'none'
                    }}
                    ref={ele => {
                        this.filePicker = ele;
                    }}
                    type="file"
                    onChange={e => this.handleUploadFile(e.target.files)}
                />
            </>
        );
    }

    public render(): JSX.Element {
        const typeConfig = this.props.typeConfig;

        const quickReplies: Tab = {
            name: 'Quick Replies',
            body: (
                <>
                    <p>
                        Quick Replies are made into buttons for supported channels. For example,
                        when asking a question, you might add a Quick Reply for "Yes" and one for
                        "No".
                    </p>
                    <TaggingElement
                        name="Replies"
                        placeholder="Quick Replies"
                        prompt="Enter a Quick Reply"
                        onChange={this.handleQuickRepliesUpdate}
                        onCheckValid={() => true}
                        entry={this.state.quickReplies}
                    />
                </>
            ),
            checked: this.state.quickReplies.value.length > 0
        };

        const attachments: Tab = {
            name: 'Attachments',
            body: this.renderAttachments(),
            checked: this.state.attachments.length > 0
        };

        const advanced: Tab = {
            name: 'Advanced',
            body: (
                <CheckboxElement
                    name="All Destinations"
                    title="All Destinations"
                    labelClassName={localStyles.checkbox}
                    checked={this.state.sendAll}
                    description="Send a message to all destinations known for this contact. If you aren't sure what this means, leave it unchecked."
                    onChange={this.handleSendAllUpdate}
                />
            ),
            checked: this.state.sendAll
        };

        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                buttons={this.getButtons()}
                tabs={[quickReplies, attachments, advanced]}
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <TextInputElement
                    name="Message"
                    showLabel={false}
                    count={Count.SMS}
                    onChange={this.handleMessageUpdate}
                    entry={this.state.text}
                    autocomplete={true}
                    focus={true}
                    textarea={true}
                />
            </Dialog>
        );
    }
}
