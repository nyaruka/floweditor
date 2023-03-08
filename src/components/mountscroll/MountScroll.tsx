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
  private container: HTMLDivElement | Window;

  constructor(props: MountScrollProps) {
    super(props);

    this.state = {
      pulse: false
    };
  }

  public componentDidMount(): void {
    const handleScrollCompleted = this.handleScrollCompleted.bind(this);

    this.container = (document.querySelector('#grid') as HTMLDivElement) || window;

    let timer: number = null;
    this.handleScroll = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        handleScrollCompleted();
        this.container.removeEventListener('scroll', this.handleScroll);
      }, 50);
    };
    this.container.addEventListener('scroll', this.handleScroll);
    this.handleScrollIntoView();
  }

  public componentWillUnmount(): void {
    this.container.removeEventListener('scroll', this.handleScroll);
  }

  private handleScrollCompleted(): void {
    this.setState({ pulse: true });
  }

  private handleScrollIntoView(): void {
    if (this.ele) {
      this.ele.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
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
