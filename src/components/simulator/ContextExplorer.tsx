import * as React from 'react';
import styles from './ContextExplorer.module.scss';
import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import { copyToClipboard } from 'utils';
import i18n from 'config/i18n';
import { Trans } from 'react-i18next';
import { DEFAULT_KEY, pruneEmpty } from './helpers';

const cx: any = classNames.bind(styles);

const EXCLUDED_PATHS: { [path: string]: boolean } = {
  'parent.run': true,
  'child.run': true,
  legacy_extra: true
};

type PathStep = number | string;

export interface ContextExplorerProps {
  visible: boolean;
  onClose: () => void;
  contents: any;
}

interface ContextExplorerState {
  opened: {};
  expression: string;
  messageVisible: boolean;
  message: string;
  showEmpty: boolean;
}

export default class ContextExplorer extends React.Component<
  ContextExplorerProps,
  ContextExplorerState
> {
  constructor(props: ContextExplorerProps) {
    super(props);
    this.state = {
      opened: {},
      expression: null,
      messageVisible: false,
      showEmpty: false,
      message: null
    };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  private handleHide(): void {
    this.props.onClose();
  }

  private isOpen(path: PathStep[]): boolean {
    let openState: any = this.state.opened;
    for (const step of path) {
      openState = openState[step];
      if (!openState) {
        return false;
      }
    }
    return true;
  }

  private handleCopyPath(key: PathStep, prevPath: PathStep[]) {
    const path: PathStep[] = [...prevPath, key];
    const expression = '@' + path.join('.');
    copyToClipboard(expression);
    this.setState({ expression, messageVisible: true, message: null }, () => {
      window.setTimeout(() => {
        if (this.state.expression === expression) {
          this.setState({ messageVisible: false });
        }
      }, 1500);
    });
  }

  private handleToggleHide(): void {
    const message = this.state.showEmpty
      ? i18n.t('context_explorer.hide_empty', 'Showing keys with values')
      : i18n.t('context_explorer.show_empty', 'Showing all keys');
    this.setState(
      { showEmpty: !this.state.showEmpty, message, expression: null, messageVisible: true },
      () => {
        window.setTimeout(() => {
          if (this.state.message === message) {
            this.setState({ messageVisible: false });
          }
        }, 1000);
      }
    );
  }

  private handlePathClick(key: PathStep, prevPath: PathStep[]) {
    const opened = { ...this.state.opened };
    const path: PathStep[] = [...prevPath, key];

    let openPath: any = opened;
    while (path.length > 0) {
      const next = path.shift();

      let closing = false;
      // if it's the last one, check if toggling
      if (path.length === 0) {
        if (openPath[next]) {
          closing = true;
        }
      }

      if (closing) {
        delete openPath[next];
      } else {
        const existing = openPath[next] || {};
        // make sure it exists
        openPath[next] = existing;
      }

      // dive down
      openPath = openPath[next];
    }

    this.setState({ opened });
  }

  private renderContextNode(name: string, value: any, path: PathStep[]): JSX.Element {
    if (!name) {
      return null;
    }

    const newPath = [...path, name];
    if (EXCLUDED_PATHS[newPath.join('.')]) {
      return null;
    }

    const valueType = typeof value;
    let text = valueType !== 'object' ? value : '';
    let hasChildren = value && valueType === 'object' && Object.keys(value).length > 0;

    if (value && value.hasOwnProperty(DEFAULT_KEY)) {
      text = value[DEFAULT_KEY];
      if (Object.keys(value).length === 1) {
        hasChildren = false;
      }
    }

    const isOpen = this.isOpen(newPath);

    const arrowStyles = cx({
      [styles.arrow_right]: true,
      [styles.has_children]: hasChildren,
      [styles.open]: isOpen
    });
    const keyStyles = cx({ [styles.key]: true, [styles.has_children]: hasChildren });
    const keySummary = Array.isArray(value) ? `[${value.length}]` : null;

    const onClick = (evt: React.MouseEvent<HTMLDivElement>) => {
      if (evt.shiftKey) {
        this.handleCopyPath(name, path);
      } else {
        if (hasChildren) {
          this.handlePathClick(name, path);
        }
      }
    };

    return (
      <div key={name + path.length}>
        <div
          className={styles.row}
          style={{ marginLeft: path.length * 10 + 'px' }}
          onClick={onClick}
        >
          <div className={arrowStyles}>›</div>
          <div className={keyStyles}>
            {name}
            <div className={styles.key_summary}>{keySummary}</div>
            <div
              className={styles.clipboard + ' fe-clipboard-empty'}
              onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
                evt.stopPropagation();
                this.handleCopyPath(name, path);
              }}
            ></div>
          </div>
          <div className={styles.str_value}>{text}</div>
        </div>
        {isOpen ? this.renderProperties(value, newPath) : null}
      </div>
    );
  }

  private renderProperties(value: any, path: PathStep[] = []): JSX.Element {
    if (!value) {
      return null;
    }

    return (
      <>
        {Object.keys(value).map((key: string) => {
          // don't show default key as a property
          if (key !== DEFAULT_KEY) {
            return this.renderContextNode(key, value[key], path);
          }
          return null;
        })}
      </>
    );
  }

  public render(): JSX.Element {
    let context = this.props.contents;
    if (this.props.contents && !this.state.showEmpty) {
      context = pruneEmpty(JSON.parse(JSON.stringify(this.props.contents)));
    }

    let message = null;
    if (this.state.message || this.state.expression) {
      if (this.state.message) {
        message = this.state.message;
      } else if (this.state.expression) {
        message = (
          <Trans
            i18nKey="context_explorer.copied_expression"
            values={{ expression: this.state.expression }}
          >
            Copied <span className={styles.expression}>[[expression]]</span> to clipboard
          </Trans>
        );
      }
    }

    const messageStyle = cx({
      [styles.message]: true,
      [styles.visible]: this.state.messageVisible
    });

    return (
      <div className={styles.context_explorer + ' ' + (this.props.visible ? styles.visible : '')}>
        <div className={messageStyle}>{message}</div>
        <div className={styles.panel}>{this.renderProperties(context)}</div>
        <div className={styles.footer}>
          <div
            className={styles.empty_toggle}
            onClick={() => {
              this.handleToggleHide();
            }}
          >
            <div className={this.state.showEmpty ? 'fe-eye' : 'fe-eye-crossed'}></div>
          </div>
        </div>
      </div>
    );
  }
}
