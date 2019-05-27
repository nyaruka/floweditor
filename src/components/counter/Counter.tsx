import { react as bindCallbacks } from 'auto-bind';
import styles from 'components/counter/Counter.module.scss';
import * as React from 'react';
import { addCommas } from 'utils';

export interface CounterProps {
  keepVisible: boolean;
  containerStyle: string;
  countStyle: string;
  count: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default class Counter extends React.Component<CounterProps> {
  private ele!: HTMLDivElement;

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

  private handleMouseEvent(event: React.MouseEvent<HTMLDivElement>, callback: () => void): void {
    event.preventDefault();
    event.stopPropagation();
    if (callback) {
      callback();
    }
  }

  private handleMouseEnter(event: React.MouseEvent<HTMLDivElement>): void {
    this.handleMouseEvent(event, this.props.onMouseEnter!);
  }

  private handleMouseLeave(event: React.MouseEvent<HTMLDivElement>): void {
    this.handleMouseEvent(event, this.props.onMouseLeave!);
  }

  private handleClick(event: React.MouseEvent<HTMLDivElement>): void {
    this.handleMouseEvent(event, this.props.onClick!);
  }

  public render(): JSX.Element | null {
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
          (this.props.onClick ? styles.clickable : '') +
          ' ' +
          (this.props.count > 0 ? styles.visible : '')
        }
        onClick={this.handleClick}
        data-spec="counter-outter"
      >
        <div
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          className={this.props.countStyle}
          data-spec="counter-inner"
        >
          {count}
        </div>
      </div>
    );
  }
}
