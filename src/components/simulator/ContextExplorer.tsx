import * as React from 'react';
import styles from './ContextExplorer.module.scss';
import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';

const DEFAULT_KEY = '__default__';
const cx: any = classNames.bind(styles);

const EXCLUDED_PATHS: { [path: string]: boolean } = {
  'parent.run': true,
  'child.run': true,
  legacy_extra: true
};

type PathStep = number | string;

interface ContextExplorerProps {
  visible: boolean;
  onClose: () => void;
  contents: any;
}

interface ContextExplorerState {
  opened: {};
}

export default class ContextExplorer extends React.Component<
  ContextExplorerProps,
  ContextExplorerState
> {
  constructor(props: ContextExplorerProps) {
    super(props);
    this.state = {
      opened: {}
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
    let text = valueType === 'string' ? value : '';
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

    const isArrayElement = isNaN(parseInt(name, 10));
    const keySummary = Array.isArray(value) ? `[${value.length}]` : null;

    const onClick = hasChildren
      ? () => {
          this.handlePathClick(name, path);
        }
      : null;

    return (
      <div key={name + path.length}>
        <div
          className={styles.row}
          style={{ marginLeft: path.length * 10 + 'px' }}
          onClick={onClick}
        >
          <div className={arrowStyles}>›</div>
          <div className={keyStyles}>
            {isArrayElement ? name : `[${name}]`}
            <div className={styles.key_summary}>{keySummary}</div>
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
    return (
      <div className={styles.context_explorer + ' ' + (this.props.visible ? styles.visible : '')}>
        <div className={'fe-x ' + styles.close_button} onClick={this.handleHide} />
        <div className={styles.panel}>{this.renderProperties(this.props.contents)}</div>
      </div>
    );
  }
}
