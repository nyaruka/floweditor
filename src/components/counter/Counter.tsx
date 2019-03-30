import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import * as styles from '~/components/counter/Counter.scss';
import { addCommas, createUUID } from '~/utils';

export interface CounterProps {
    keepVisible: boolean;
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
    private ele: HTMLDivElement;

    constructor(props: CounterProps) {
        super(props);
        this.key = createUUID();

        bindCallbacks(this, {
            include: [/^handle/, /^get/]
        });
    }

    public componentDidMount(): void {
        this.handleRequestUpdate();
        this.handleScrollIntoView();
    }

    public componentDidUpdate(prevProps: CounterProps, prevState: CounterState): void {
        if (prevState === null || this.state.count !== prevState.count) {
            this.handleScrollIntoView();
        }
    }

    private handleScrollIntoView(): void {
        if (!!this.ele) {
            if (this.state.count > 0 && this.props.keepVisible) {
                window.setTimeout(() => {
                    window.scrollTo({
                        top: this.ele.getBoundingClientRect().top - 200 + window.scrollY,
                        behavior: 'smooth'
                    });
                }, 200);
            }
        }
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

    public handleRequestUpdate(): void {
        const count = this.props.getCount();
        this.setState({ count });
    }

    private handleRef(ref: HTMLDivElement): HTMLDivElement {
        return (this.ele = ref);
    }

    public render(): JSX.Element {
        if (this.state && this.state.count > 0) {
            const count = addCommas(this.state.count);
            return (
                <div
                    className={styles.counter + ' ' + this.props.containerStyle}
                    onClick={this.handleClick}
                    data-spec="counter-outter"
                    ref={this.handleRef}
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
