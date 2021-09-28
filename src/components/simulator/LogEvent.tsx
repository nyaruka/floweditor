import Dialog, { ButtonSet } from 'components/dialog/Dialog';
import { MediaPlayer } from 'components/mediaplayer/MediaPlayer';
import Modal from 'components/modal/Modal';
import styles from 'components/simulator/LogEvent.module.scss';
import { Types } from 'config/interfaces';
import { Flow, Group, Label } from 'flowTypes';
import * as React from 'react';
import { createUUID, getURNPath } from 'utils';
import i18n from 'config/i18n';
import { Trans } from 'react-i18next';

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
  value?: string | { text: string };
  body?: string;
  addresses?: string[];
  to?: string[];
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
  labels?: Label[];
  msg?: MsgProps;
  http_logs?: WebRequestLog[];
  extra?: any;
  urns?: string[];
  service?: string;
  classifier?: { uuid: string; name: string };
  ticketer?: { uuid: string; name: string };
  ticket?: { subject: string; body: string };
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
  // localized text can have html entities, so this isn't as dangerous as it looks
  return (
    <div key={info} className={styles.info}>
      <span dangerouslySetInnerHTML={{ __html: info }} />
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
    } else if (type.startsWith('application')) {
      return (
        <div
          onClick={() => {
            window.open(url);
          }}
          style={{
            cursor: 'pointer',
            textDecoration: 'none',
            padding: '10px 12px',
            background: '#e6e6e6',
            color: '#666'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              className="fe-document-file-pdf"
              style={{
                textDecoration: 'none',
                fontSize: '20px'
              }}
            />
            <div style={{ marginLeft: '5px', lineHeight: '16px' }}>
              {i18n.t('document', 'Document')}
            </div>
          </div>
        </div>
      );
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
        ? text
            .trim()
            .split('\n')
            .map((item, key) => {
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

  private renderGroupsChanged(): JSX.Element {
    let parts: string[] = [];
    if (this.props.groups_added) {
      const info = i18n.t('simulator.added_to_group', 'Added to');
      parts.push(
        info + ' ' + this.renderValueList(this.props.groups_added.map(group => group.name))
      );
    }
    if (this.props.groups_removed) {
      const info = i18n.t('simulator.removed_from_group', 'Removed from');
      parts.push(
        info + ' ' + this.renderValueList(this.props.groups_removed.map(group => group.name))
      );
    }

    return renderInfo(parts.join('. '));
  }

  private renderLabelsAdded(): JSX.Element {
    let info = i18n.t('simulator.input_labels_added', 'Message labeled with');

    return renderInfo(
      info + ' ' + this.renderValueList(this.props.labels.map(label => label.name))
    );
  }

  private renderEmailSent(): JSX.Element {
    const recipients = this.props.to || this.props.addresses;
    return this.renderClickable(
      <div className={styles.info + ' ' + styles.email}>
        <Trans
          i18nKey="simulator.sent_email.summary"
          values={{ recipients: this.renderValueList(recipients), subject: this.props.subject }}
        >
          Sent email to [[recipients]] with subject "[[subject]]"
        </Trans>
      </div>,
      <Dialog
        title={i18n.t('simulator.sent_email.title', 'Email Details')}
        headerClass={Types.send_email}
        buttons={this.getButtons()}
        noPadding={true}
      >
        <div className={styles.email_details}>
          <div className={styles.to}>
            {i18n.t('email.to', 'To')}: {this.renderValueList(recipients)}
          </div>
          <div className={styles.subject}>
            {i18n.t('email.subject', 'Subject')}: {this.props.subject}
          </div>
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
        title={i18n.t('simulator.httplog_dialog', 'HTTP Request Details')}
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
        return renderInfo(i18n.t('simulator.msg_wait', 'Waiting for reply'));
      case 'contact_groups_changed':
        return this.renderGroupsChanged();
      case 'contact_urns_changed':
        return renderInfo('Added a URN for the contact');
      case 'contact_field_changed':
        const value = this.getValue(this.props.value);
        if (value !== '') {
          return renderInfo(
            i18n.t('simulator.contact_field_changed', 'Set contact "[[field]]" to "[[value]]"', {
              field: this.props.field.name,
              value: this.getValue(this.props.value)
            })
          );
        } else {
          return renderInfo(
            i18n.t('simulator.contact_field_cleared', 'Cleared contact "[[field]]"', {
              field: this.props.field.name
            })
          );
        }
      case 'run_result_changed':
        return renderInfo(
          i18n.t('simulator.run_result_changed', 'Set result "[[field]]" to "[[value]]"', {
            field: this.props.name,
            value: this.getValue(this.props.value)
          })
        );
      case 'contact_name_changed':
        return renderInfo(
          i18n.t('simulator.contact_name_changed', 'Set contact name to "[[name]]"', {
            name: this.props.name
          })
        );
      case 'email_created':
      case 'email_sent':
        return this.renderEmailSent();
      case 'broadcast_created':
        return renderMessage(
          this.props.translations[this.props.base_language].text,
          this.props.msg ? this.props.msg.attachments : [],
          Direction.MT
        );
      case 'resthook_called':
        return renderInfo(
          i18n.t('simulator.resthook_called', 'Triggered flow event "[[resthook]]"', {
            resthook: this.props.resthook
          })
        );
      case 'service_called':
        if (this.props.service === 'classifier') {
          return this.renderWebhook(Types.call_classifier);
        }
        break;
      case 'webhook_called':
        return this.renderWebhook(Types.call_webhook);
      case 'flow_entered':
        return renderInfo(
          i18n.t('simulator.flow_entered', 'Entered flow "[[flow]]"', {
            flow: this.props.flow.name
          })
        );
      case 'session_triggered':
        return renderInfo(
          i18n.t('simulator.session_triggered', 'Started somebody else in "[[flow]]"', {
            flow: this.props.flow.name
          })
        );
      case 'contact_language_changed':
        return renderInfo(
          i18n.t('simulator.contact_language_changed', 'Set preferred language to "[[language]]"', {
            language: this.props.language
          })
        );
      case 'contact_status_changed':
        return renderInfo(
          i18n.t('simulator.contact_status_changed', 'Set status to "[[status]]"', {
            status: this.props.status
          })
        );
      case 'info':
        return renderInfo(this.props.text);
      case 'input_labels_added':
        return this.renderLabelsAdded();
      case 'environment_refreshed':
        return null;
      case 'ticket_opened':
        return renderInfo(
          i18n.t('simulator.ticket_opened', 'Ticket opened with subject "[[subject]]"', {
            subject: this.props.ticket.subject
          })
        );
      case 'airtime_transferred':
        const event = this.props as AirtimeTransferEvent;
        return (
          <>
            {this.renderWebhook(Types.transfer_airtime)}

            {renderInfo(
              i18n.t(
                'simulator.airtime_transferred',
                'Transferred [[amount]] [[currency]] to [[recipient]]',
                {
                  amount: event.actual_amount,
                  currency: event.currency,
                  recipient: getURNPath(event.recipient)
                }
              )
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

  /**
   * Helper to render a list of values with each value quoted
   */
  private renderValueList(values: string[]): string {
    let text = '';
    let delim = '';
    values.forEach(value => {
      text += `${delim}"${value}"`;
      delim = ', ';
    });
    return text;
  }

  /**
   * Helper for value fields which can be an object (contact_field_changed) or string (run_result_changed)
   */
  private getValue(value: string | { text: string } | null): string {
    if (!value) {
      return '';
    } else if (typeof value === 'string') {
      return value;
    }
    return value.text;
  }
}
