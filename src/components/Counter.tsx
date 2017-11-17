import * as React from 'react';
import { v4 as generateUUID } from 'uuid';

import { addCommas } from '../helpers/utils';

const styles = require('./Counter.scss');

export interface ICounterProps {
    containerStyle: string;
    countStyle: string;
    getCount(): number;
    onUnmount(key: string): void;
}

export interface ICounterState {
    count: number;
}

export default class Counter extends React.Component<ICounterProps, ICounterState> {
    private key: string;

    constructor(props: ICounterProps) {
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
