import * as React from 'react';
import { range } from '~/utils';

import * as styles from './Loading.scss';

export interface LoadingProps {
    size: number;
    balls: number;
    color: string;
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

export default class Loading extends React.Component<LoadingProps, LoadingState> {
    constructor(props: LoadingProps) {
        super(props);

        this.state = {
            color: hexToRgb(props.color)
        };
    }

    public render(): JSX.Element {
        return (
            <div className={styles.loading} style={{ width: '100%', height: '100%' }}>
                {range(0, this.props.balls).map((num: number) => (
                    <div
                        key={`ball_${num}`}
                        style={{
                            width: this.props.size,
                            height: this.props.size,
                            left: this.props.size * num + this.props.size * num,
                            animationDelay: `-${1 - num * (1 / this.props.balls)}s`,
                            background: `rgba(${this.state.color.r},${this.state.color.g},${
                                this.state.color.b
                            }, ${1 - num * (1 / this.props.balls)})`
                        }}
                    />
                ))}
            </div>
        );
    }
}
