import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import Counter from 'components/counter/Counter';
import DragHelper from 'components/draghelper/DragHelper';
import { getExitActivityKey } from 'components/flow/exit/helpers';
import Loading from 'components/loading/Loading';
import { fakePropType } from 'config/ConfigProvider';
import { Cancel, getRecentMessages } from 'external';
import { Category, Exit, FlowNode, LocalizationMap, StartFlowExitNames } from 'flowTypes';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RecentContact } from 'store/editor';
import { Asset } from 'store/flowContext';
import AppState from 'store/state';
import { DisconnectExit, disconnectExit, DispatchWithState } from 'store/thunks';
import { createClickHandler, getLocalization, renderIf } from 'utils';

import * as moment from 'moment';
import styles from './Exit.module.scss';
import { Portal } from 'components/Portal';
import i18n from 'config/i18n';
import { SIMULATOR_CONTACT_UUID } from 'components/simulator/Simulator';

export interface RenderCategory extends Category {
  missing: boolean;
}

export interface ExitPassedProps {
  exit: Exit;
  categories: Category[];
  node: FlowNode;
  showDragHelper: boolean;
  plumberMakeSource: (id: string) => void;
  plumberRemove: (id: string) => void;
  plumberConnectExit: (node: FlowNode, exit: Exit) => void;
  plumberUpdateClass: (
    node: FlowNode,
    exit: Exit,
    className: string,
    confirmDelete: boolean
  ) => void;
}

export interface ExitStoreProps {
  translating: boolean;
  dragging: boolean;
  language: Asset;
  localization: LocalizationMap;
  uuid: String;
  disconnectExit: DisconnectExit;
  segmentCount: number;
  recentContacts: RecentContact[];
}

export type ExitProps = ExitPassedProps & ExitStoreProps;

export interface ExitState {
  confirmDelete: boolean;
  recentContacts: RecentContact[];
  fetchingRecentContacts: boolean;
  showDragHelper: boolean;
}

const cx: any = classNames.bind(styles);
export class ExitComp extends React.PureComponent<ExitProps, ExitState> {
  private timeout: number;
  private hideDragHelper: number;
  private pendingMessageFetch: Cancel = {};
  private ele: HTMLDivElement;
  private lastEnter = new Date().getTime();

  constructor(props: ExitProps) {
    super(props);

    this.state = {
      confirmDelete: false,
      recentContacts: null,
      fetchingRecentContacts: false,
      showDragHelper: props.showDragHelper
    };

    bindCallbacks(this, {
      include: [/^on/, /^get/, /^handle/, /^connect/]
    });
  }

  public static contextTypes = {
    config: fakePropType
  };

  public getSourceId(): string {
    return `${this.props.node.uuid}:${this.props.exit.uuid}`;
  }

  public handleDisconnect(): void {
    this.setState({ showDragHelper: false });
  }

  public componentDidMount(): void {
    this.props.plumberMakeSource(this.getSourceId());

    if (this.ele) {
      this.ele.addEventListener('disconnect', this.handleDisconnect);
    }

    if (this.props.exit.destination_uuid) {
      this.connect();
    }
  }

  public componentDidUpdate(prevProps: ExitProps): void {
    if (this.props.exit.destination_uuid !== prevProps.exit.destination_uuid) {
      this.connect();
      if (this.state.confirmDelete) {
        this.setState({ confirmDelete: false });
      }
    }

    if (this.state.showDragHelper && prevProps.showDragHelper && !this.props.showDragHelper) {
      this.setState({ showDragHelper: false });
    }

    this.props.plumberUpdateClass(
      this.props.node,
      this.props.exit,
      'confirm-delete',
      this.state.confirmDelete
    );
  }

  public componentWillUnmount(): void {
    if (this.props.exit.destination_uuid) {
      this.props.plumberRemove(this.getSourceId());
    }

    if (this.ele) {
      this.ele.removeEventListener('disconnect', this.handleDisconnect);
    }
  }

  private handleMouseDown(event: React.MouseEvent<HTMLElement>): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private handleClick(event: React.MouseEvent<HTMLElement>): void {
    if (!this.props.translating) {
      if (this.props.exit.destination_uuid) {
        event.preventDefault();
        event.stopPropagation();
        this.setState(
          {
            confirmDelete: true
          },
          () => {
            this.timeout = window.setTimeout(() => {
              this.setState({
                confirmDelete: false
              });
            }, 2000);
          }
        );
      } else {
        event.preventDefault();
        event.stopPropagation();
        if (!this.state.showDragHelper) {
          this.setState({ showDragHelper: true }, () => {
            if (this.hideDragHelper) {
              window.clearTimeout(this.hideDragHelper);
            }
            this.hideDragHelper = window.setTimeout(() => {
              this.setState({ showDragHelper: false });
            }, 3000);
          });
        }
      }
    }
  }

  private onDisconnect(event: React.MouseEvent<HTMLElement>): void {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }

    if (this.hideDragHelper) {
      window.clearTimeout(this.hideDragHelper);
    }

    this.props.disconnectExit(this.props.node.uuid, this.props.exit.uuid);
  }

  private connect(): void {
    this.props.plumberConnectExit(this.props.node, this.props.exit);
  }

  private handleShowRecentMessages(): void {
    if (this.props.recentContacts) {
      this.setState({ recentContacts: this.props.recentContacts });
      return;
    }

    this.setState({ fetchingRecentContacts: true }, () => {
      getRecentMessages(
        this.context.config.endpoints.recents,
        this.props.exit,
        this.pendingMessageFetch,
        this.props.uuid
      )
        .then((recentContacts: RecentContact[]) => {
          this.setState({ recentContacts, fetchingRecentContacts: false });
        })
        .catch(() => {
          // we may have been canceled
        });
    });
  }

  private handleHideRecentMessages(): void {
    if (this.pendingMessageFetch.reject) {
      this.pendingMessageFetch.reject();
      this.pendingMessageFetch = {};
    }

    this.setState({ fetchingRecentContacts: false, recentContacts: null });
  }

  private getSegmentCount(): JSX.Element {
    // Only exits with a destination have activity
    if (this.props.segmentCount > 0) {
      const key = `${this.props.exit.uuid}-label`;
      return (
        <div style={{ position: 'absolute', bottom: '-25px' }}>
          <Counter
            key={key}
            count={this.props.segmentCount}
            containerStyle={styles.activity}
            countStyle={styles.count}
            keepVisible={false}
            onMouseEnter={() => {
              this.lastEnter = new Date().getTime();
              this.handleShowRecentMessages();
            }}
            onMouseLeave={() => {
              if (new Date().getTime() - this.lastEnter < 100) {
                this.handleHideRecentMessages();
              }
            }}
          />
        </div>
      );
    }
  }

  public getName(): { name: string; localized?: boolean; disabled?: boolean } {
    let disabled = false;
    if (
      this.props.categories &&
      this.props.categories.some(
        (category: Category) => category.name === StartFlowExitNames.Expired
      )
    ) {
      disabled = true;
    }

    if (this.props.translating) {
      let name = '';
      let delim = '';

      let localized = false;

      this.props.categories.forEach((category: Category) => {
        const localization = getLocalization(
          category,
          this.props.localization,
          this.props.language
        );

        localized = localized || 'name' in localization.localizedKeys;
        const localizedObject = localization.getObject() as Category;
        name += delim + localizedObject.name;
        delim = ', ';
      });

      return { name, localized, disabled };
    } else {
      const names: string[] = [];
      this.props.categories.forEach((cat: Category) => {
        names.push(cat.name);
      });

      return {
        name: names.join(', '),
        disabled
      };
    }
  }

  private getRecentContacts(): JSX.Element {
    if (this.state.fetchingRecentContacts || this.state.recentContacts !== null) {
      const recentContacts = this.state.recentContacts || [];
      const hasRecents = recentContacts.length !== 0;

      const recentStyles = [styles.recent_contacts];

      let title = i18n.t('recent_contacts.header', 'Recent Contacts');
      if (!hasRecents && !this.state.fetchingRecentContacts) {
        title = i18n.t('recent_contacts.header_empty', 'No Recent Contacts');
        recentStyles.push(styles.no_recents);
      }

      const canvas = document.getElementById('canvas-container');
      let left = 0;
      let top = 0;

      if (canvas) {
        const canvasBounds = canvas.getBoundingClientRect();
        const canvasOffset = canvasBounds.top + window.scrollY;
        const rect = this.ele.getBoundingClientRect();
        left = rect.left + window.scrollX + 5 - canvasBounds.left;
        top = rect.top + window.scrollY - canvasOffset + 30;
      }

      let getContactURL = (uuid: string): string => {
        return this.context.config.endpoints.contact + uuid;
      };

      return (
        <Portal id="activity_recent_contacts">
          <div
            className={recentStyles.join(' ')}
            style={{ position: 'absolute', left, top }}
            onMouseDown={event => {
              event.stopPropagation();
              event.preventDefault();
            }}
            onMouseUp={event => {
              event.stopPropagation();
              event.preventDefault();
            }}
          >
            <div className="pointer-capture" style={{ display: 'flex', marginTop: '-20px' }}>
              <div className="left" style={{ flexGrow: 1, pointerEvents: 'none' }}></div>
              <div
                onMouseLeave={this.handleHideRecentMessages}
                className="middle"
                style={{
                  width: '50px',
                  height: '40px',
                  marginBottom: '-20px',
                  paddingBottom: '20px'
                }}
              >
                &nbsp;
              </div>
              <div className="right" style={{ flexGrow: 1 }}></div>
            </div>
            <div
              className={styles.container}
              onMouseEnter={() => {
                this.setState({ recentContacts, fetchingRecentContacts: false });
              }}
              onMouseLeave={this.handleHideRecentMessages}
            >
              <div className={styles.title}>{title}</div>
              {recentContacts.map((recentContact: RecentContact, idx: number) => {
                let opRow: JSX.Element = null;
                if (recentContact.operand) {
                  opRow = <div className={styles.operand}>{recentContact.operand}</div>;
                }
                return (
                  <div key={'recent_' + idx} className={styles.row}>
                    {recentContact.contact && (
                      <div className={styles.contact}>
                        {recentContact.contact.uuid === SIMULATOR_CONTACT_UUID ? (
                          recentContact.contact.name
                        ) : (
                          <a href={getContactURL(recentContact.contact.uuid)}>
                            {recentContact.contact.name}
                          </a>
                        )}
                      </div>
                    )}
                    {opRow}
                    <div className={styles.time}>{moment.utc(recentContact.time).fromNow()}</div>
                  </div>
                );
              })}
              {this.state.recentContacts === null ? (
                <div className={styles.loading}>
                  <Loading size={10} units={6} color="#999999" />
                </div>
              ) : null}
            </div>
          </div>
        </Portal>
      );
    }
    return null;
  }

  public render(): JSX.Element {
    const { name, localized, disabled } = this.getName();

    const nameStyle = name ? styles.name : '';
    const connected = this.props.exit.destination_uuid ? ' jtk-connected' : '';
    const dragNodeClasses = cx(styles.endpoint, connected);
    const confirmDelete =
      this.state.confirmDelete && this.props.exit.hasOwnProperty('destination_uuid');
    const confirm: JSX.Element =
      confirmDelete && this.context.config.mutable ? (
        <div
          className={styles.confirm_x}
          {...createClickHandler(this.onDisconnect, () => this.props.dragging)}
        >
          <temba-icon name="delete_small"></temba-icon>
        </div>
      ) : null;
    const exitClasses: string = cx({
      [styles.exit]: true,
      'plumb-exit': true,
      [styles.translating]: this.props.translating,
      [styles.unnamed_exit]: name == null,
      [styles.missing_localization]: name && this.props.translating && !localized,
      [styles.confirm_delete]: confirmDelete,
      [styles.disabled]: disabled
    });

    const activity = this.getSegmentCount();
    const recents = this.getRecentContacts();

    const events = this.context.config.mutable
      ? createClickHandler(
          this.handleClick,
          () => {
            return this.props.dragging;
          },
          this.handleMouseDown
        )
      : {};

    return (
      <div className={exitClasses}>
        {name ? <div className={nameStyle}>{name}</div> : null}
        <div
          ref={(ref: HTMLDivElement) => (this.ele = ref)}
          {...events}
          id={`${this.props.node.uuid}:${this.props.exit.uuid}`}
          className={dragNodeClasses}
        >
          {confirm}
        </div>
        {activity}
        {recents}
        {renderIf(this.state.showDragHelper)(<DragHelper />)}
      </div>
    );
  }
}

const mapStateToProps = (
  {
    flowContext: {
      definition: { localization, uuid }
    },
    editorState: { translating, language, dragActive, activity }
  }: AppState,
  props: ExitPassedProps
) => {
  // see if we have some passed in (simulated) contacts
  let recentContacts: RecentContact[] = null;
  const key = getExitActivityKey(props.exit);
  if (key in (activity.recentContacts || {})) {
    recentContacts = activity.recentContacts[key];
  }
  const segmentCount = activity.segments[getExitActivityKey(props.exit)] || 0;

  return {
    dragging: dragActive,
    segmentCount,
    translating,
    language,
    localization,
    uuid,
    recentContacts
  };
};

const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators({ disconnectExit }, dispatch);

const ConnectedExit = connect(
  mapStateToProps,
  mapDispatchToProps
)(ExitComp);

export default ConnectedExit;
