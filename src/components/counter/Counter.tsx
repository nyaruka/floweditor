import * as React from 'react';
import { v4 as generateUUID } from 'uuid';
import { addCommas } from '~/utils';

import * as styles from '~/components/counter/Counter.scss';

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
        this.handleClick = this.handleClick.bind(this);
    }

    public componentDidMount(): void {
        this.requestUpdate();
    }

    public componentWillUnmount(): void {
        this.props.onUnmount(this.getKey());
    }

    private handleClick(event: React.MouseEvent<HTMLDivElement>): void {
        // for now, just make sure it doesn't propagate to our parent
        event.preventDefault();
        event.stopPropagation();
    }

    public getKey(): string {
        return this.key;
    }

    public requestUpdate(): void {
        const count = this.props.getCount();
        this.setState({ count });
    }

    public render(): JSX.Element {
        if (this.state && this.state.count > 0) {
            const count = addCommas(this.state.count);
            return (
                <div
                    className={styles.counter + ' ' + this.props.containerStyle}
                    onClick={this.handleClick}
                    data-spec="counter-outter"
                >
                    <div className={this.props.countStyle} data-spec="counter-inner">
                        {count}
                    </div>
                </div>
            );
        }
        return null;
    }
}
