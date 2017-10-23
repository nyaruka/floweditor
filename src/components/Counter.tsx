import * as React from 'react';
import * as UUID from 'uuid';

import { addCommas } from '../utils';

const styles = require('./Counter.scss');

export interface CounterProps {
    containerStyle: string;
    countStyle: string;
    getCount(): number;
    onUnmount(key: string): void;
}

export interface CounterState {
    count: number;
}

export class CounterComp extends React.Component<CounterProps, CounterState> {
    // private key: string;

    constructor(props: CounterProps) {
        super(props);
        // this.key = UUID.v4();
        // this.getKey = this.getKey.bind(this); 
        this.requestUpdate = this.requestUpdate.bind(this); 
    }

    componentDidMount() {
        this.requestUpdate();
    }

    componentWillUnmount() {
        // this.props.onUnmount(this.getKey());
    }

    private handleClick(event: React.MouseEvent<HTMLDivElement>) {
        // for now, just make sure it doesn't propagate to our parent
        event.preventDefault();
        event.stopPropagation();
    }

    // public getKey() {
    //     return this.key;
    // }

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
                    data-spec='counter-outter'>
                    <div
                        className={this.props.countStyle}
                        data-spec='counter-inner'>
                        {count}
                    </div>
                </div>
            );
        }
        return null;
    }
}
