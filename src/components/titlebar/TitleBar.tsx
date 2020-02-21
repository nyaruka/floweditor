import * as React from 'react';
import { createClickHandler } from 'utils';

import styles from './TitleBar.module.scss';
import { fakePropType } from 'config/ConfigProvider';
import i18n from 'config/i18n';

export interface TitleBarProps {
  title: string;
  onRemoval(event: React.MouseEvent<HTMLElement>): any;
  __className?: string;
  showRemoval?: boolean;
  showMove?: boolean;
  onMoveUp?(event: React.MouseEvent<HTMLElement>): any;
  shouldCancelClick?: () => boolean;
}

interface TitleBarState {
  confirmingRemoval: boolean;
}

export const confirmationTime = 2000;

export const titlebarContainerSpecId = 'titlebar-container';
export const titlebarSpecId = 'titlebar';
export const moveIconSpecId = 'move-icon';
export const moveSpecId = 'move';
export const removeIconSpecId = 'remove-icon';
export const confirmationSpecId = 'confirmation';
export const confirmRemovalSpecId = 'confirm-removal';

/**
 * Simple title bar with confirmation removal
 */
export default class TitleBar extends React.Component<TitleBarProps, TitleBarState> {
  private confirmationTimeout: number;

  public static contextTypes = {
    config: fakePropType
  };

  constructor(props: TitleBarProps) {
    super(props);

    this.state = {
      confirmingRemoval: false
    };

    this.handleConfirmRemoval = this.handleConfirmRemoval.bind(this);
  }

  public componentWillUnmount(): void {
    if (this.confirmationTimeout) {
      window.clearTimeout(this.confirmationTimeout);
    }
  }

  public handleMouseUpCapture(event: React.MouseEvent<HTMLElement>): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  public handleConfirmRemoval(event: React.MouseEvent<HTMLElement>): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.setState({
      confirmingRemoval: true
    });

    this.confirmationTimeout = window.setTimeout(
      () =>
        this.setState({
          confirmingRemoval: false
        }),
      confirmationTime
    );
  }

  private getMoveArrow(): JSX.Element {
    let moveArrow: JSX.Element = null;

    if (this.props.showMove && this.context.config.mutable) {
      moveArrow = (
        <div
          className={styles.up_button}
          {...createClickHandler(
            this.props.onMoveUp,
            this.props.shouldCancelClick,
            this.handleMouseUpCapture
          )}
          data-testid={moveIconSpecId}
        >
          <span className="fe-arrow-up" />
        </div>
      );
    } else {
      moveArrow = <div className={styles.up_button} data-spec={moveSpecId} />;
    }

    return moveArrow;
  }

  private getRemove(): JSX.Element {
    let remove: JSX.Element = (
      <div className={styles.remove_button} data-testid={removeIconSpecId}></div>
    );

    if (this.props.showRemoval && this.context.config.mutable) {
      remove = (
        <div
          className={styles.remove_button}
          {...createClickHandler(
            this.handleConfirmRemoval,
            this.props.shouldCancelClick,
            this.handleMouseUpCapture
          )}
          data-testid={removeIconSpecId}
        >
          <span className="fe-x" />
        </div>
      );
    }

    return remove;
  }

  private getConfirmationEl(): JSX.Element {
    let confirmation: JSX.Element;

    if (this.state.confirmingRemoval && this.context.config.mutable) {
      confirmation = (
        <div className={styles.remove_confirm} data-spec={confirmationSpecId}>
          <div className={styles.up_button} data-spec={moveSpecId} />
          <div className={styles.titletext}>{i18n.t('removal_confirmation', 'Remove?')}</div>
          <div
            className={styles.remove_button}
            {...createClickHandler(
              this.props.onRemoval,
              this.props.shouldCancelClick,
              this.handleMouseUpCapture
            )}
            data-testid={confirmRemovalSpecId}
          >
            <span className="fe-x" />
          </div>
        </div>
      );
    }

    return confirmation;
  }

  public render(): JSX.Element {
    const confirmation: JSX.Element = this.getConfirmationEl();
    const moveArrow: JSX.Element = this.getMoveArrow();
    const remove: JSX.Element = this.getRemove();
    return (
      <div className={styles.titlebar} data-spec={titlebarContainerSpecId}>
        <div className={`${this.props.__className} ${styles.normal}`} data-spec={titlebarSpecId}>
          {moveArrow}
          <div className={styles.titletext}>{this.props.title}</div>
          {remove}
        </div>
        {confirmation}
      </div>
    );
  }
}
