import * as React from 'react';
import { range } from 'utils';

import styles from './Loading.module.scss';

export interface LoadingProps {
  size: number;
  units: number;
  color: string;
  square?: boolean;
}

interface Color {
  r: number;
  g: number;
  b: number;
}

interface LoadingState {
  color: Color;
}

const hexToRgb = (hex: string): Color => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
};

export default class Loading extends React.Component<
  LoadingProps,
  LoadingState
> {
  constructor(props: LoadingProps) {
    super(props);

    this.state = {
      color: hexToRgb(props.color)
    };
  }

  public render(): JSX.Element {
    return (
      <div
        className={styles.loading}
        style={{
          width: this.props.size * this.props.units * 2,
          height: this.props.size
        }}
      >
        {range(0, this.props.units).map((num: number) => (
          <div
            key={`ball_${num}`}
            style={{
              borderRadius: this.props.square ? "0" : "50%",
              width: this.props.size,
              height: this.props.size,
              margin: this.props.size / 3,
              animationDelay: `-${1 - num * (1 / this.props.units)}s`,
              background: `rgba(${this.state.color.r},${this.state.color.g},${
                this.state.color.b
              }, ${1 - num * (1 / this.props.units)})`
            }}
          />
        ))}
      </div>
    );
  }
}
