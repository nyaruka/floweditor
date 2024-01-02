import * as React from 'react';

import styles from './Pill.module.scss';

export interface PillProps {
  advanced?: boolean;
  onClick?(event: React.MouseEvent<HTMLDivElement>): void;
  text: string;
  maxLength?: number;
  icon?: string;
  large?: boolean;
  style?: React.CSSProperties;
}

const Pill: React.SFC<PillProps> = (props: PillProps): JSX.Element => {
  let text = props.text;

  if (props.text.startsWith('@')) {
    text = '@(exp)';
  } else if (props.maxLength && text.length > props.maxLength) {
    text = props.text.substring(0, props.maxLength) + '...';
  }

  const pillStyles = [styles.pill];

  if (props.large) {
    pillStyles.push(styles.large);
  }

  if (props.onClick) {
    pillStyles.push(styles.clickable);
  }

  return (
    <div
      style={props.style}
      data-advanced={props.advanced}
      onClick={props.onClick}
      className={pillStyles.join(' ')}
    >
      <div>{text}</div>
      {props.icon ? (
        <temba-icon
          data-advanced={props.advanced}
          name={props.icon}
          style={{ marginLeft: '7px' }}
        ></temba-icon>
      ) : null}
    </div>
  );
};

export default Pill;
