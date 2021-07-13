import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import styles from './MediaPlayer.module.scss';

export interface MediaPlayerProps {
  url: string;
  triggered?: boolean;
}

interface MediaPlayerState {
  durationSeconds: number;
  currentSeconds: number;
  progress: number;
  playing: boolean;
}

export class MediaPlayer extends React.Component<MediaPlayerProps, MediaPlayerState> {
  private ele: HTMLAudioElement;

  private stroke = 1;
  private radius = 9;

  private radiusNormalized = this.radius - this.stroke * 2;
  private circumference = this.radiusNormalized * 2 * Math.PI;

  constructor(props: MediaPlayerProps) {
    super(props);

    this.state = {
      durationSeconds: 0,
      currentSeconds: 0,
      playing: false,
      progress: 0
    };

    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  private handleTimeUpdate(e: React.SyntheticEvent<HTMLAudioElement>): void {
    const currentTime = this.ele.currentTime || 0;
    const duration = this.ele.duration || 0;

    this.setState((prevState: MediaPlayerState) => {
      if ((this.ele.ended || currentTime === 0) && prevState.playing) {
        setTimeout(() => {
          this.setState({ progress: 0, playing: false });
        }, 500);
      }

      const progress = duration > 0 ? Math.floor((currentTime / duration) * 100) : 0;

      return {
        currentSeconds: this.ele.ended || progress === 100 ? 0 : currentTime,
        durationSeconds: duration,
        playing: currentTime > 0 && !this.ele.ended,
        progress: progress
      };
    });
  }

  public componentDidMount(): void {
    if (this.props.triggered) {
      this.handleTogglePlay(null);
    }
  }

  private handleTogglePlay(e: React.MouseEvent<HTMLDivElement>): void {
    if (e !== null) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (this.state.playing) {
      this.ele.pause();
      this.ele.currentTime = 0;
    } else {
      this.ele.load();
      this.ele.play();
    }
  }

  private handleRef(ref: HTMLAudioElement): any {
    return (this.ele = ref);
  }

  public componentDidUpdate(prevProps: MediaPlayerProps): void {
    if (this.props.url !== prevProps.url) {
      this.setState({
        durationSeconds: 0,
        currentSeconds: 0,
        playing: false,
        progress: 0
      });
    }
  }

  public render(): JSX.Element {
    const progress = this.state.progress || 0;
    const strokeDashoffset = this.circumference - (progress / 100) * this.circumference;

    return (
      <div
        className={styles.player + ' ' + (this.state.playing ? styles.playing : '')}
        style={{ height: this.radius * 2, width: this.radius * 2 }}
        onMouseUp={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={this.handleTogglePlay}
      >
        <audio
          ref={this.handleRef}
          onTimeUpdate={this.handleTimeUpdate}
          src={this.props.url}
          preload="none"
        />

        <div className={styles.circles}>
          <svg height={this.radius * 2} width={this.radius * 2}>
            <circle
              className={styles.circle_background}
              stroke="#fff"
              fill="#fff"
              strokeWidth={this.stroke}
              r={this.radiusNormalized}
              cx={this.radius}
              cy={this.radius}
            />
            <circle
              className={styles.circle_background}
              stroke="#ddd"
              fill="transparent"
              strokeWidth={this.stroke}
              r={this.radiusNormalized}
              cx={this.radius}
              cy={this.radius}
            />
            <circle
              className={styles.circle_foreground}
              stroke="cornflowerblue"
              fill="transparent"
              strokeWidth={this.stroke}
              strokeDasharray={this.circumference + ' ' + this.circumference}
              style={{ strokeDashoffset }}
              r={this.radiusNormalized}
              cx={this.radius}
              cy={this.radius}
            />
          </svg>
        </div>
        <div className={styles.button + ' ' + (this.state.playing ? 'fe-stop' : 'fe-play_arrow')} />
      </div>
    );
  }
}
