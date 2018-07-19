import * as React from 'react';

const styles = require('./Flipper.scss');

export interface FlipperProps {
    front: JSX.Element;
    back: JSX.Element;
    flipped?: boolean;
}

interface FlipperState {
    flipped: boolean;
}

/**
 * A component that has a front and back and can flip back and forth between them
 */
export default class Flipper extends React.Component<FlipperProps, FlipperState> {
    constructor(props: FlipperProps) {
        super(props);
        this.state = {
            flipped: this.props.flipped
        };

        this.handleFlip = this.handleFlip.bind(this);
    }

    public handleFlip(): void {
        this.setState({ flipped: !this.state.flipped });
    }

    public render(): JSX.Element {
        const activeClasses = [styles.flipper];
        if (this.state.flipped) {
            activeClasses.push(styles.flipped);
        }

        return (
            <div className={activeClasses.join(' ')}>
                <div className={`${styles.side} ${styles.front}`}>
                    <span className={`${styles.toggleButton} fe-cog`} onClick={this.handleFlip} />
                    {this.props.front}
                </div>
                <div className={`${styles.side} ${styles.back}`}>
                    <span className={`${styles.toggleButton} fe-back`} onClick={this.handleFlip} />
                    {this.props.back}
                </div>
            </div>
        );
    }
}
