import * as React from 'react';
import { primary } from '~/components/button/Button.scss';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import Modal from '~/components/modal/Modal';
import * as styles from '~/components/simulator/Simulator.scss';
import { Types } from '~/config/typeConfigs';
import { Group } from '~/flowTypes';

interface MsgProps {
    text: string;
    uuid: string;
    urn: string;
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

    public render(): JSX.Element {
        const classes: string[] = [];
        let text: JSX.Element = null;
        let details: JSX.Element = null;
        let groupText: string = '';
        let delim: string = '';

        switch (this.props.type) {
            case 'msg_received':
                // TODO: why does MR return msg_received without a msg
                if (!this.props.msg) {
                    return null;
                }
                text = <span>{this.props.msg.text}</span>;
                classes.push(styles.msgReceived);
                break;
            case 'msg_created':
                const spans = this.props.msg.text.split('\n').map((item, key) => {
                    return (
                        <span key={key}>
                            {item}
                            <br />
                        </span>
                    );
                });
                text = <span> {spans} </span>;
                classes.push(styles.sendMsg);
                break;
            case 'error':
                text = <span> Error: {this.props.text} </span>;
                classes.push(styles.error);
                break;
            case 'msg_wait':
                text = <span>Waiting for reply</span>;
                classes.push(styles.info);
                break;
            /** fall-through desired in this case */
            case 'contact_groups_changed':
                const groups = this.props.groups_added || this.props.groups_removed;
                groupText = this.props.groups_added ? 'Added to ' : 'Removed from ';
                delim = ' ';
                groups.forEach(group => {
                    groupText += `${delim}"${group.name}"`;
                    delim = ', ';
                });
                text = <span>{groupText}</span>;
                classes.push(styles.info);
                break;
            case 'contact_urns_changed':
                text = <span>Added a URN for the contact</span>;
                classes.push(styles.info);
                break;
            case Types.set_contact_field:
                text = (
                    <span>
                        Set contact field "{this.props.field}" to "{this.props.value}"
                    </span>
                );
                classes.push(styles.info);
                break;
            case Types.set_run_result:
                text = (
                    <span>
                        Set flow result "{this.props.name}" to "{this.props.value}"
                    </span>
                );
                classes.push(styles.info);
                break;
            case Types.set_contact_name:
                text = (
                    <span>
                        Updated contact {this.props.field} to "{this.props.value}"
                    </span>
                );
                classes.push(styles.info);
                break;
            case Types.send_email:
                text = (
                    <span>
                        Sent email to "{this.props.email}" with subject "{this.props.subject}" and
                        body "{this.props.body}"
                    </span>
                );
                classes.push(styles.info);
                break;
            case 'broadcast_created':
                const msg = this.props.translations[this.props.base_language].text;
                text = <span>{msg}</span>;
                classes.push(styles.sendMsg);

                break;
            case 'webhook_called':
                text = <span>Called webhook {this.props.url}</span>;
                classes.push(styles.info, styles.webhook);
                details = (
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
                break;
            case 'info':
                text = <span>{this.props.text}</span>;
                classes.push(styles.info);
                break;
        }

        classes.push(styles.evt);
        if (details) {
            classes.push(styles.hasDetail);

            return (
                <div>
                    <div className={classes.join(' ')} onClick={this.showDetails}>
                        {text}
                    </div>
                    <Modal show={this.state.detailsVisible}>
                        <div className={styles.eventViewer}>{details}</div>
                    </Modal>
                </div>
            );
        } else {
            return (
                <div>
                    <div className={classes.join(' ')}>{text}</div>
                </div>
            );
        }
    }
}
