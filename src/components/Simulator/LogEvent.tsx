import * as React from 'react';
import { Group } from '../../flowTypes';
import Modal from '../Modal';

import * as styles from './Simulator.scss';

export interface EventProps {
    uuid: string;
    created_on?: Date;
    type: string;
    field_name: string;
    field_uuid: string;
    result_name: string;
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

    showDetails() {
        this.setState({ detailsVisible: true });
    }

    render() {
        const classes: string[] = [];
        let text: JSX.Element = null;
        let details: JSX.Element = null;
        let detailTitle: string = '';
        let groupText: string = '';
        let delim: string = '';

        switch (this.props.type) {
            case 'msg_received':
                text = <span>{this.props.text}</span>;
                classes.push(styles.msg_received);
                break;
            case 'send_msg':
                const spans = this.props.text.split('\n').map((item, key) => {
                    return (
                        <span key={key}>
                            {item}
                            <br />
                        </span>
                    );
                });
                text = <span> {spans} </span>;
                classes.push(styles.send_msg);
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
            case 'add_to_group':
            case 'remove_from_group':
                groupText = this.props.type === 'add_to_group' ? 'Added to ' : 'Removed from ';
                delim = ' ';
                this.props.groups.forEach(group => {
                    groupText += `${delim}"${group.name}"`;
                    delim = ', ';
                });
                text = <span>{groupText}</span>;
                classes.push(styles.info);
                break;
            case 'save_contact_field':
                text = (
                    <span>
                        Set contact field "{this.props.field_name}" to "{this.props.value}"
                    </span>
                );
                classes.push(styles.info);
                break;
            case 'save_flow_result':
                text = (
                    <span>
                        Set flow result "{this.props.result_name}" to "{this.props.value}"
                    </span>
                );
                classes.push(styles.info);
                break;
            case 'update_contact':
                text = (
                    <span>
                        Updated contact {this.props.field_name} to "{this.props.value}"
                    </span>
                );
                classes.push(styles.info);
                break;
            case 'send_email':
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
                    <div className={styles.webhook_details}>
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
            classes.push(styles.has_detail);

            return (
                <div>
                    <div className={classes.join(' ')} onClick={this.showDetails}>
                        {text}
                    </div>
                    <Modal
                        __className={styles[`detail_${this.props.type}`]}
                        title={[<div>{detailTitle}</div>]}
                        show={this.state.detailsVisible}
                        buttons={{
                            primary: {
                                name: 'Ok',
                                onClick: () => {
                                    this.setState({ detailsVisible: false });
                                }
                            }
                        }}>
                        <div className={styles.event_viewer}>{details}</div>
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
