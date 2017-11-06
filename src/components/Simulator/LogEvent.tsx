import * as React from 'react';
import { IGroup } from '../../flowTypes';
import Modal from '../Modal';

const styles = require('./Simulator.scss');

export interface IEventProps {
    uuid: string;
    created_on?: Date;
    type: string;
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
    groups?: IGroup[];
    field_name: string;
    field_uuid: string;
    result_name: string;
}

interface ILogEventState {
    detailsVisible: boolean;
}

/**
 * Viewer for log events
 */
class LogEvent extends React.Component<IEventProps, ILogEventState> {
    constructor(props: IEventProps) {
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
        var classes = [];
        var text: JSX.Element = null;
        var details: JSX.Element = null;
        var detailTitle = '';

        if (this.props.type == 'msg_received') {
            text = <span>{this.props.text}</span>;
            classes.push(styles.msg_received);
        } else if (this.props.type == 'send_msg') {
            var spans = this.props.text.split('\n').map((item, key) => {
                return (
                    <span key={key}>
                        {item}
                        <br />
                    </span>
                );
            });
            text = <span> {spans} </span>;
            classes.push(styles.send_msg);
        } else if (this.props.type == 'error') {
            text = <span> Error: {this.props.text} </span>;
            classes.push(styles.error);
        } else if (this.props.type == 'msg_wait') {
            text = <span>Waiting for reply</span>;
            classes.push(styles.info);
        } else if (this.props.type == 'add_to_group') {
            var groupText = 'Added to ';
            var delim = ' ';
            for (let group of this.props.groups) {
                groupText += delim + '"' + group.name + '"';
                delim = ', ';
            }
            text = <span>{groupText}</span>;
            classes.push(styles.info);
        } else if (this.props.type == 'remove_from_group') {
            var groupText = 'Removed from ';
            var delim = ' ';
            for (let group of this.props.groups) {
                groupText += delim + '"' + group.name + '"';
                delim = ', ';
            }
            text = <span>{groupText}</span>;
            classes.push(styles.info);
        } else if (this.props.type == 'save_contact_field') {
            text = (
                <span>
                    Set contact field "{this.props.field_name}" to "{this.props.value}"
                </span>
            );
            classes.push(styles.info);
        } else if (this.props.type == 'save_flow_result') {
            text = (
                <span>
                    Set flow result "{this.props.result_name}" to "{this.props.value}"
                </span>
            );
            classes.push(styles.info);
        } else if (this.props.type == 'update_contact') {
            text = (
                <span>
                    Updated contact {this.props.field_name} to "{this.props.value}"
                </span>
            );
            classes.push(styles.info);
        } else if (this.props.type == 'send_email') {
            text = (
                <span>
                    Sent email to "{this.props.email}" with subject "{this.props.subject}" and body
                    "{this.props.body}"
                </span>
            );
            classes.push(styles.info);
        } else if (this.props.type == 'webhook_called') {
            text = <span>Called webhook {this.props.url}</span>;
            classes.push(styles.info);
            classes.push(styles.webhook);
            detailTitle = 'Webhook Details';
            details = (
                <div className={styles.webhook_details}>
                    <div className={styles.request}>{this.props.request}</div>
                    <div className={styles.response}>{this.props.response}</div>
                </div>
            );
        } else if (this.props.type == 'info') {
            text = <span>{this.props.text}</span>;
            classes.push(styles.info);
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
                        className={styles['detail_' + this.props.type]}
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

export default LogEvent;
