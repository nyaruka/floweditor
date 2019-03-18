import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { MediaPlayer } from '~/components/mediaplayer/MediaPlayer';
import Modal from '~/components/modal/Modal';
import * as styles from '~/components/simulator/LogEvent.scss';
import { Types } from '~/config/interfaces';
import { Group } from '~/flowTypes';

const MAP_THUMB = require('static/images/map.jpg');

interface MsgProps {
    text: string;
    uuid: string;
    urn: string;
    attachments?: string[];
    quick_replies?: string[];
}

export interface EventProps {
    uuid?: string;
    created_on?: Date;
    type?: string;
    field?: string;
    field_uuid?: string;
    result_name?: string;
    text?: string;
    name?: string;
    value?: string;
    body?: string;
    email?: string;
    subject?: string;
    url?: string;
    status?: string;
    status_code?: number;
    request?: string;
    response?: string;
    base_language?: string;
    translations?: { [lang: string]: { [text: string]: string } };
    groups?: Group[];
    groups_added?: Group[];
    groups_removed?: Group[];
    msg?: MsgProps;
}

interface LogEventState {
    detailsVisible: boolean;
}

export enum Direction {
    MT,
    MO
}

const getStyleForDirection = (direction: Direction): string => {
    return direction === Direction.MO ? styles.msgReceived : styles.sendMsg;
};

const renderError = (error: string): JSX.Element => {
    return (
        <div className={styles.error}>
            <span>Error: {error}</span>
        </div>
    );
};

const renderInfo = (info: string): JSX.Element => {
    return (
        <div className={styles.info}>
            <span>{info}</span>
        </div>
    );
};

const renderAttachment = (attachment: string): JSX.Element => {
    const idx = attachment.indexOf(':');
    if (idx > -1) {
        const type = attachment.substr(0, idx);
        const url = attachment.substr(idx + 1);
        if (type.startsWith('audio')) {
            return (
                <div className={styles.audioAttachment}>
                    <div className={styles.mediaPlayer}>
                        <MediaPlayer url={url} />
                    </div>
                    <div className={styles.audioText}>Audio Recording</div>
                </div>
            );
        } else if (type.startsWith('image')) {
            return <img src={url} />;
        } else if (type.startsWith('geo')) {
            return <img src={MAP_THUMB} />;
        } else if (type.startsWith('video')) {
            return (
                <div className={styles.videoAttachment}>
                    <video controls={true} src={url} />
                </div>
            );
        }
    }
    return null;
};

const renderMessage = (text: string, attachments: string[], direction: Direction): JSX.Element => {
    const attaches = attachments || [];
    return (
        <div className={getStyleForDirection(direction)}>
            {attaches.map((attachment: string) => (
                <div key={text + attachment}>{renderAttachment(attachment)}</div>
            ))}
            {text
                ? text.split('\n').map((item, key) => {
                      return (
                          <div key={key} className={styles.msgText}>
                              {item}
                          </div>
                      );
                  })
                : null}
        </div>
    );
};

/**
 * Viewer for log events
 */
export default class LogEvent extends React.Component<EventProps, LogEventState> {
    constructor(props: EventProps) {
        super(props);
        this.state = {
            detailsVisible: false
        };

        this.showDetails = this.showDetails.bind(this);
        this.getButtons = this.getButtons.bind(this);
    }

    private getButtons(): ButtonSet {
        return {
            primary: {
                name: 'Ok',
                onClick: () => {
                    this.setState({ detailsVisible: false });
                }
            }
        };
    }

    private showDetails(): void {
        this.setState({ detailsVisible: true });
    }

    private renderGroupChange(): JSX.Element {
        const groups = this.props.groups_added || this.props.groups_removed;
        let groupText = this.props.groups_added ? 'Added to ' : 'Removed from ';
        let delim = ' ';
        groups.forEach(group => {
            groupText += `${delim}"${group.name}"`;
            delim = ', ';
        });

        return renderInfo(groupText);
    }

    private renderWebhook(): JSX.Element {
        return this.renderClickable(
            <div className={styles.info + ' ' + styles.webhook}>
                <span>Called webhook {this.props.url}</span>
            </div>,
            <Dialog
                title="Webhook Details"
                headerClass={Types.call_webhook}
                buttons={this.getButtons()}
                noPadding={true}
            >
                <div className={styles.webhookDetails}>
                    <div className={''}>{this.props.request}</div>
                    <div className={styles.response}>{this.props.response}</div>
                </div>
            </Dialog>
        );
    }

    private renderClickable(element: JSX.Element, details: JSX.Element): JSX.Element {
        return (
            <div>
                <div className={styles.hasDetail} onClick={this.showDetails}>
                    {element}
                </div>
                <Modal show={this.state.detailsVisible}>
                    <div className={styles.eventViewer}>{details}</div>
                </Modal>
            </div>
        );
    }

    public renderLogEvent(): JSX.Element {
        switch (this.props.type) {
            case 'msg_received':
                return renderMessage(this.props.msg.text, this.props.msg.attachments, Direction.MO);
            case 'msg_created':
                return renderMessage(this.props.msg.text, this.props.msg.attachments, Direction.MT);
            case 'ivr_created':
                return renderMessage(this.props.msg.text, this.props.msg.attachments, Direction.MT);
            case 'error':
                return renderError(this.props.text);
            case 'msg_wait':
                return renderInfo('Waiting for reply');
            case 'contact_groups_changed':
                return this.renderGroupChange();
            case 'contact_urns_changed':
                return renderInfo('Added a URN for the contact');
            case Types.set_contact_field:
                return renderInfo(
                    `Set contact field "${this.props.field}" to "${this.props.value}"`
                );
            case 'run_result_changed':
                return renderInfo(`Set flow result "${this.props.name}" to "${this.props.value}"`);
            case Types.set_contact_name:
                return renderInfo(`Updated contact ${this.props.field} to "${this.props.value}"`);
            case Types.send_email:
                return renderInfo(
                    `Sent email to "${this.props.email}" with subject "${
                        this.props.subject
                    }" and body "${this.props.body}"`
                );
            case 'broadcast_created':
                return renderMessage(
                    this.props.translations[this.props.base_language].text,
                    this.props.msg.attachments,
                    Direction.MT
                );
            case 'webhook_called':
                return this.renderWebhook();
            case 'info':
                return renderInfo(this.props.text);
        }
        return renderInfo(`Missing render for ${this.props.type}`);
    }

    public render(): JSX.Element {
        return <div className={styles.evt}>{this.renderLogEvent()}</div>;
    }
}
