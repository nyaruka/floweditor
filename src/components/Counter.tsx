import * as React from 'react';
import * as UUID from 'uuid';

import { Exit, Node } from '../FlowDefinition';
import { External } from '../services/External';
import { ActivityManager } from "../services/ActivityManager";
import { addCommas } from '../utils';

var styles = require('./Counter.scss');

interface CounterProps {
    containerStyle: string;
    countStyle: string;
    getCount(): number;
    onUnmount(key: string): void;
}

interface CounterState {
    count: number;
}

export class CounterComp extends React.Component<CounterProps, CounterState> {

    private key: string;

    constructor(props: CounterProps) {
        super(props);
        this.key = UUID.v4();
    }

    componentDidMount() {
        this.requestUpdate();
    }

    componentWillUnmount() {
        this.props.onUnmount(this.getKey());
    }

    private onClick(event: React.MouseEvent<HTMLDivElement>) {
        // for now, just make sure it doesn't propagate to our parent
        event.preventDefault();
        event.stopPropagation();
    }

    public getKey() {
        return this.key;
    }

    public requestUpdate() {
        this.setState({
            count: this.props.getCount()
        });
    }

    render() {
        if (this.state && this.state.count > 0) {
            var count = addCommas(this.state.count);
            return (
                <div className={styles.counter + " " + this.props.containerStyle} onClick={this.onClick}>
                    <div className={this.props.countStyle}>
                        {count}
                    </div>
                </div>
            )
        }
        return null;
    }
}