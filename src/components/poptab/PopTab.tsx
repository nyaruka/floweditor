import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from './PopTab.module.scss';

export interface PopTabProps {
  color: string;
  icon: string;
  label: string;
  header: string;
  top: string;
  visible: boolean;
  onShow: () => void;
  onHide: () => void;
}

export interface PopTabState {
  width: number;
}

export class PopTab extends React.Component<PopTabProps, PopTabState> {
  private poppedEle: HTMLDivElement;

  constructor(props: PopTabProps) {
    super(props);
    this.state = { width: 258 };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public componentDidUpdate(): void {
    if (this.state.width !== this.poppedEle.offsetWidth) {
      this.setState({ width: this.poppedEle.offsetWidth });
    }
  }

  private handlePoppedRef(ref: HTMLDivElement): HTMLDivElement {
    return (this.poppedEle = ref);
  }

  private handleTabClick(): void {
    this.props.onShow();
  }

  private handleClose(): void {
    this.props.onHide();
  }
  public render(): JSX.Element {
    return (
      <div
        className={
          'pop_wrapper ' + styles.pop_wrapper + ' ' + (this.props.visible ? styles.visible : '')
        }
        style={{
          right: -this.state.width,
          top: this.props.top
        }}
      >
        <div className={styles.tab_wrapper}>
          <div
            className={styles.tab}
            style={{ background: this.props.color }}
            onClick={this.handleTabClick}
          >
            <div className={styles.icon}>
              <span className={this.props.icon} />
            </div>
            <div className={styles.label}>{this.props.label}</div>
          </div>
        </div>
        <div
          ref={this.handlePoppedRef}
          className={styles.popped}
          style={{
            borderColor: this.props.color,
            right: this.props.visible ? 15 + this.state.width : 0,
            top: -100
          }}
        >
          <div className={styles.header} style={{ background: this.props.color }}>
            <div className={styles.close + ' fe-x'} onClick={this.handleClose} />
            <div className={styles.header_label}>{this.props.header}</div>
          </div>
          <div className={styles.body} style={{ background: this.props.color }}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
