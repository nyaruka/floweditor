import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { renderIf } from 'utils';

import styles from './Button.module.scss';

export enum ButtonTypes {
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'tertiary'
}
export interface ButtonProps {
  name: string;
  onClick: any;
  disabled?: boolean;
  type?: ButtonTypes;
  leftSpacing?: boolean;
  topSpacing?: boolean;
  iconName?: string;
  onRef?: (ele: any) => void;
}

interface ButtonState {
  active: boolean;
}

export default class Button extends React.Component<ButtonProps, ButtonState> {
  constructor(props: ButtonProps) {
    super(props);
    this.state = {
      active: false
    };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  private handleMouseDown(event: React.MouseEvent<HTMLDivElement>): void {
    this.setState({ active: true });
  }

  private handleMouseUp(event: React.MouseEvent<HTMLDivElement>): void {
    this.setState({ active: false });
  }

  public render(): JSX.Element {
    const { onRef, name, onClick, type, disabled, leftSpacing, topSpacing, iconName } = this.props;

    return (
      <div
        ref={onRef}
        style={{
          marginLeft: leftSpacing ? 10 : 0,
          marginTop: topSpacing ? 10 : 0
        }}
        onClick={onClick}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        className={`${styles.btn} ${styles[type!]} ${disabled ? styles.disabled : ''} ${
          this.state.active ? styles.active : ''
        }`}
      >
        {renderIf(iconName != null)(<span style={{ paddingRight: 4 }} className={iconName} />)}
        {name}
      </div>
    );
  }
}
