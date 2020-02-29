import * as React from 'react';
import classNames from 'classnames/bind';
import styles from './MountScroll.module.scss';

const cx: any = classNames.bind(styles);

interface MountScrollProps {
  pulseAfterScroll?: boolean;
}

interface MountScrollState {
  pulse: boolean;
}

export default class MountScroll extends React.Component<MountScrollProps, MountScrollState> {
  private ele!: HTMLDivElement;
  private handleScroll: () => void;

  constructor(props: MountScrollProps) {
    super(props);

    this.state = {
      pulse: false
    };
  }

  public componentDidMount(): void {
    const handleScrollCompleted = this.handleScrollCompleted.bind(this);

    let timer: number = null;
    this.handleScroll = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        handleScrollCompleted();
        window.removeEventListener('scroll', this.handleScroll);
      }, 50);
    };

    window.addEventListener('scroll', this.handleScroll);
    this.handleScrollIntoView();
  }

  public componentWillUnmount(): void {
    window.removeEventListener('scroll', this.handleScroll);
  }

  private handleScrollCompleted(): void {
    this.setState({ pulse: true });
  }

  private handleScrollIntoView(): void {
    if (!!this.ele) {
      const scrollTo = this.ele.getBoundingClientRect().top - 200 + window.scrollY;

      if (scrollTo !== window.scrollY) {
        const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
        if (atBottom && scrollTo > window.scrollY) {
          this.handleScrollCompleted();
        } else {
          window.setTimeout(() => {
            window.scrollTo({
              top: scrollTo,
              behavior: 'smooth'
            });
          }, 0);
        }
      } else {
        this.handleScrollCompleted();
      }
    }
  }

  public render(): JSX.Element | null {
    const classes = cx({
      [styles.wrapper]: true,
      [styles.pulse]: this.state.pulse
    });

    return (
      <div
        className={classes}
        ref={(ele: HTMLDivElement) => {
          this.ele = ele;
        }}
      >
        {this.props.children}
      </div>
    );
  }
}
