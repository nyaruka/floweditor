import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import * as styles from '~/components/counter/Counter.scss';
import { addCommas } from '~/utils';

export interface CounterProps {
    keepVisible: boolean;
    containerStyle: string;
    countStyle: string;
    count: number;
    onClick?: () => void;
}

export default class Counter extends React.Component<CounterProps> {
    private ele: HTMLDivElement;

    constructor(props: CounterProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^handle/, /^get/]
        });
    }

    public componentDidMount(): void {
        this.handleScrollIntoView();
    }

    public componentDidUpdate(prevProps: CounterProps): void {
        if (prevProps.count !== this.props.count) {
            this.handleScrollIntoView();
        }
    }

    private handleScrollIntoView(): void {
        if (!!this.ele) {
            if (this.props.count > 0 && this.props.keepVisible) {
                window.setTimeout(() => {
                    window.scrollTo({
                        top: this.ele.getBoundingClientRect().top - 200 + window.scrollY,
                        behavior: 'smooth'
                    });
                }, 200);
            }
        }
    }

    private handleClick(event: React.MouseEvent<HTMLDivElement>): void {
        // for now, just make sure it doesn't propagate to our parent
        event.preventDefault();
        event.stopPropagation();
        if (this.props.onClick) {
            this.props.onClick();
        }
    }

    public render(): JSX.Element {
        if (this.props.count > 0) {
            const count = addCommas(this.props.count);
            return (
                <div
                    ref={(ele: HTMLDivElement) => {
                        this.ele = ele;
                    }}
                    className={
                        styles.counter +
                        ' ' +
                        this.props.containerStyle +
                        ' ' +
                        (this.props.onClick ? styles.clickable : '')
                    }
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
