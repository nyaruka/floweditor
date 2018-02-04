import * as React from 'react';
import { v4 as generateUUID } from 'uuid';

import { addCommas } from '../helpers/utils';

import * as styles from './Counter.scss';

export interface CounterProps {
    containerStyle: string;
    countStyle: string;
    getCount(): number;
    onUnmount(key: string): void;
}

export interface CounterState {
    count: number;
}

export default class Counter extends React.Component<CounterProps, CounterState> {
    private key: string;

    constructor(props: CounterProps) {
        super(props);
        this.key = generateUUID();
        this.getKey = this.getKey.bind(this);
        this.requestUpdate = this.requestUpdate.bind(this);
    }

    componentDidMount() {
        this.requestUpdate();
    }

    componentWillUnmount() {
        this.props.onUnmount(this.getKey());
    }

    private handleClick(event: React.MouseEvent<HTMLDivElement>) {
        // for now, just make sure it doesn't propagate to our parent
        event.preventDefault();
        event.stopPropagation();
    }

    public getKey() {
        return this.key;
    }

    public requestUpdate() {
        const count = this.props.getCount();
        this.setState({ count });
    }

    render() {
        if (this.state && this.state.count > 0) {
            const count = addCommas(this.state.count);
            return (
                <div
                    className={styles.counter + ' ' + this.props.containerStyle}
                    onClick={this.handleClick}
                    data-spec="counter-outter">
                    <div className={this.props.countStyle} data-spec="counter-inner">
                        {count}
                    </div>
                </div>
            );
        }
        return null;
    }
}
