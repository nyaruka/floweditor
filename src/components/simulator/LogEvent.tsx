import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { MediaPlayer } from 'components/mediaplayer/MediaPlayer';
import Modal from 'components/modal/Modal';
import styles from 'components/simulator/LogEvent.module.scss';
import { Types } from 'config/interfaces';
import { Flow, Group } from 'flowTypes';
import * as React from 'react';
import { createUUID, getURNPath } from 'utils';

const MAP_THUMB = require('static/images/map.jpg');

interface MsgProps {
  text: string;
  uuid: string;
  urn: string;
  attachments?: string[];
  quick_replies?: string[];
}

interface WebRequestLog {
  url: string;
  request: string;
  response: string;
}

interface ClassifierIntent {
  name: string;
  confidence: number;
}

interface ClassifierEntity {
  value: string;
  confidence: number;
}

export interface EventProps {
  step_uuid: string;
  uuid?: string;
  created_on?: string;
  type?: string;
  field?: { key: string; name: string };
  field_uuid?: string;
  result_name?: string;
  text?: string;
  name?: string;
  value?: { text: string };
  body?: string;
  addresses?: string[];
  subject?: string;
  url?: string;
  status?: string;
  status_code?: number;
  request?: string;
  response?: string;
  resthook?: string;
  base_language?: string;
  language?: string;
  translations?: { [lang: string]: { [text: string]: string } };
  groups?: Group[];
  flow?: Flow;
  groups_added?: Group[];
  groups_removed?: Group[];
  msg?: MsgProps;
  http_logs?: WebRequestLog[];
  extra?: any;
}

interface FlowEvent {
  step_uuid: string;
  type: string;
}

interface AirtimeTransferEvent extends FlowEvent {
  actual_amount: number;
  desired_amount: number;
  currency: string;
  http_logs: WebRequestLog[];
  recipient: string;
  sender: string;
}

interface LogEventState {
  detailsVisible: boolean;
}

export enum Direction {
  MT,
  MO
}

const getStyleForDirection = (direction: Direction): string => {
  return direction === Direction.MO ? styles.msg_received : styles.send_msg;
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
    <div key={info} className={styles.info}>
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
        <div className={styles.audio_attachment}>
          <div className={styles.media_player}>
            <MediaPlayer url={url} />
          </div>
          <div className={styles.audio_text}>Audio Recording</div>
        </div>
      );
    } else if (type.startsWith('image')) {
      return <img src={url} alt="Attachment" />;
    } else if (type.startsWith('geo')) {
      return <img src={MAP_THUMB} alt="Attachment" />;
    } else if (type.startsWith('video')) {
      return (
        <div className={styles.video_attachment}>
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
              <div key={createUUID()} className={styles.msg_text}>
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

  private renderEmail(): JSX.Element {
    return this.renderClickable(
      <div className={styles.info + ' ' + styles.email}>
        {`Sent email to "${this.props.addresses.join(', ')}" with subject "${this.props.subject}
                "`}
      </div>,
      <Dialog
        title="Email Details"
        headerClass={Types.send_email}
        buttons={this.getButtons()}
        noPadding={true}
      >
        <div className={styles.email_details}>
          <div className={styles.to}>To: {this.props.addresses.join(', ')}</div>
          <div className={styles.subject}>Subject: {this.props.subject}</div>
          <div className={styles.body}>{this.props.body}</div>
        </div>
      </Dialog>
    );
  }

  private renderHTTPRequest(headerClass: Types, log: WebRequestLog): JSX.Element {
    return this.renderClickable(
      <div className={styles.info + ' ' + styles.webhook}>
        <span>Called {log.url}</span>
      </div>,
      <Dialog
        title="HTTP Request Details"
        headerClass={headerClass}
        buttons={this.getButtons()}
        noPadding={true}
      >
        <div className={styles.webhook_details}>
          <div className={''}>{log.request}</div>
          <div className={styles.response}>{log.response}</div>
        </div>
      </Dialog>
    );
  }

  private renderWebhook(headerClass: Types): JSX.Element {
    if (this.props.http_logs) {
      return (
        <>
          {this.props.http_logs.map((log: WebRequestLog) => {
            return this.renderHTTPRequest(headerClass, log);
          })}
        </>
      );
    }
    if (this.props.url) {
      return this.renderHTTPRequest(headerClass, this.props as WebRequestLog);
    }
  }

  private renderClickable(element: JSX.Element, details: JSX.Element): JSX.Element {
    return (
      <div key={this.props.step_uuid}>
        <div className={styles.has_detail} onClick={this.showDetails}>
          {element}
        </div>
        <Modal show={this.state.detailsVisible}>
          <div className={styles.event_viewer}>{details}</div>
        </Modal>
      </div>
    );
  }

  private renderClassification(): JSX.Element {
    return (
      <table className={styles.classification}>
        <tbody>
          {(this.props.extra.intents || []).map((intent: ClassifierIntent) => (
            <tr key={intent.name + intent.confidence}>
              <td>{intent.name}</td>
              <td>intent</td>
              <td>{intent.confidence.toFixed(3)}</td>
            </tr>
          ))}

          {Object.keys(this.props.extra.entities || []).map((key: string) => {
            const entities = this.props.extra.entities[key];
            return entities.map((entity: ClassifierEntity) =>
              key !== entity.value ? (
                <tr key={entity.value + entity.confidence}>
                  <td>{entity.value}</td>
                  <td>{key}</td>
                  <td>{entity.confidence.toFixed(3)}</td>
                </tr>
              ) : null
            );
          })}
        </tbody>
      </table>
    );
  }

  public renderLogEvent(): JSX.Element {
    if (this.props.extra && this.props.extra.intents) {
      return this.renderClassification();
    }

    switch (this.props.type) {
      case 'msg_received':
        return renderMessage(this.props.msg.text, this.props.msg.attachments, Direction.MO);
      case 'msg_created':
        return renderMessage(this.props.msg.text, this.props.msg.attachments, Direction.MT);
      case 'ivr_created':
        return renderMessage(this.props.msg.text, this.props.msg.attachments, Direction.MT);
      case 'error':
        return renderError(this.props.text);
      case 'failure':
        return renderError(this.props.text);
      case 'msg_wait':
        return renderInfo('Waiting for reply');
      case 'contact_groups_changed':
        return this.renderGroupChange();
      case 'contact_urns_changed':
        return renderInfo('Added a URN for the contact');
      case 'contact_field_changed':
        return renderInfo(`Set contact "${this.props.field.name}" to "${this.props.value.text}"`);
      case 'run_result_changed':
        return renderInfo(`Set result "${this.props.name}" to "${this.props.value}"`);
      case 'contact_name_changed':
        return renderInfo(`Set contact name to "${this.props.name}"`);
      case 'email_created':
        return this.renderEmail();
      case 'broadcast_created':
        return renderMessage(
          this.props.translations[this.props.base_language].text,
          this.props.msg ? this.props.msg.attachments : [],
          Direction.MT
        );
      case 'resthook_called':
        return renderInfo(`Trigerred flow event ${this.props.resthook}`);
      case 'classifier_called':
        return this.renderWebhook(Types.call_classifier);
      case 'webhook_called':
        return this.renderWebhook(Types.call_webhook);
      case 'flow_entered':
        return renderInfo(`Entered flow ${this.props.flow.name}`);
      case 'session_triggered':
        return renderInfo(`Started somebody else in ${this.props.flow.name}`);
      case 'contact_language_changed':
        return renderInfo(`Set preferred language to ${this.props.language}`);
      case 'info':
        return renderInfo(this.props.text);
      case 'environment_refreshed':
        return null;
      case 'airtime_transferred':
        const event = this.props as AirtimeTransferEvent;
        return (
          <>
            {this.renderWebhook(Types.transfer_airtime)}
            {renderInfo(
              `Transferred ${event.actual_amount} ${event.currency} to ${getURNPath(
                event.recipient
              )}`
            )}
          </>
        );
    }

    // should only get here if we are get an unexpected event
    console.log('Simulator render missing', this.props);
    return null;
  }

  public render(): JSX.Element {
    return <div className={styles.evt}>{this.renderLogEvent()}</div>;
  }
}
