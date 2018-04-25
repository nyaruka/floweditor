import * as React from 'react';
import { Group } from '../../flowTypes';
import Modal from '../Modal';

import * as styles from './Simulator.scss';
import { Types } from '../../config/typeConfigs';
import { dump } from '../../utils';

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
    groups?: Group[];
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
    }

    private showDetails(): void {
        this.setState({ detailsVisible: true });
    }

    public render(): JSX.Element {
        const classes: string[] = [];
        let text: JSX.Element = null;
        let details: JSX.Element = null;
        let detailTitle: string = '';
        let groupText: string = '';
        let delim: string = '';

        console.log(this.props.type);
        switch (this.props.type) {
            case 'msg_received':
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
            case Types.add_contact_groups:
            case Types.remove_contact_groups:
                groupText =
                    this.props.type === Types.add_contact_groups ? 'Added to ' : 'Removed from ';
                delim = ' ';
                this.props.groups.forEach(group => {
                    groupText += `${delim}"${group.name}"`;
                    delim = ', ';
                });
                text = <span>{groupText}</span>;
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
            case Types.set_contact_property:
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
            case 'webhook_called':
                text = <span>Called webhook {this.props.url}</span>;
                classes.push(styles.info, styles.webhook);
                detailTitle = 'Webhook Details';
                details = (
                    <div className={styles.webhookDetails}>
                        <div className={''}>{this.props.request}</div>
                        <div className={styles.response}>{this.props.response}</div>
                    </div>
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
                    <Modal
                        __className={styles[`detail_${this.props.type}`]}
                        // tslint:disable-next-line:jsx-key
                        title={[<div>{detailTitle}</div>]}
                        show={this.state.detailsVisible}
                        buttons={{
                            primary: {
                                name: 'Ok',
                                onClick: () => {
                                    this.setState({ detailsVisible: false });
                                }
                            }
                        }}
                    >
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
