import { react as bindCallbacks } from 'auto-bind';
import { Dimensions, FlowPosition } from 'flowTypes';
import * as React from 'react';
import { newPosition } from 'store/helpers';

import styles from './CanvasDraggable.module.scss';
import { onNextRender } from 'utils';

export interface CanvasDraggableProps {
  position: FlowPosition;
  uuid: string;
  idx: number;
  elementCreator: (props: CanvasDraggableProps) => JSX.Element;
  config?: any;
  // should our draggable be initialized as dragged
  dragOnAdd?: boolean;

  selected?: boolean;

  onAnimated?: (uuid: string) => void;
  updateDimensions?: (uuid: string, position: Dimensions) => void;
  onDragStart?: (uuid: string, clickedPosition: FlowPosition) => void;
  onDragStop?: () => void;
}

export interface CanvasDraggableState {
  width?: number;
  height?: number;
}

export class CanvasDraggable extends React.Component<CanvasDraggableProps, CanvasDraggableState> {
  private ele!: HTMLDivElement;

  constructor(props: CanvasDraggableProps) {
    super(props);
    bindCallbacks(this, {
      include: [/^handle/, 'ref']
    });

    this.state = {};
  }

  private ref(ref: HTMLDivElement): any {
    return (this.ele = ref);
  }

  public componentDidMount(): void {
    if (this.ele) {
      if (this.props.updateDimensions) {
        const width = this.ele.clientWidth || this.props.position.right - this.props.position.left;
        const height =
          this.ele.clientHeight || this.props.position.bottom - this.props.position.top;
        this.setState({ width, height }, () => {
          this.props.updateDimensions(this.props.uuid, {
            width,
            height
          });
        });
      }
    }
  }

  public shouldComponentUpdate(nextProps: CanvasDraggableProps, state: any, context: any): boolean {
    return (
      nextProps.position.left !== this.props.position.left ||
      nextProps.position.top !== this.props.position.top ||
      nextProps.position.right !== this.props.position.right ||
      nextProps.position.bottom !== this.props.position.bottom ||
      nextProps.idx !== this.props.idx ||
      nextProps.selected !== this.props.selected ||
      nextProps.config !== this.props.config
    );
  }

  public componentDidUpdate(
    prevProps: CanvasDraggableProps,
    prevState: CanvasDraggableState
  ): void {
    // traceUpdate(this, prevProps, prevState);

    // we want to check our dimensions after our next render
    onNextRender(() => {
      if (this.ele) {
        if (this.ele.clientWidth && this.ele.clientHeight) {
          if (
            this.state.width !== this.ele.clientWidth ||
            this.state.height !== this.ele.clientHeight
          ) {
            if (this.props.updateDimensions) {
              const height = this.ele.clientHeight;
              const width = this.ele.clientWidth;

              this.setState({ width, height }, () => {
                this.props.updateDimensions(this.props.uuid, { width, height });
              });
            }
          }
        }
      }
    });
  }

  private handleMouseUp(event: React.MouseEvent<HTMLDivElement>): void {
    if (event.nativeEvent.which === 3) {
      return;
    }
    if (this.props.onDragStop) {
      this.props.onDragStop();
    }
  }

  private handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    // ignore clicks in textareas
    if (!this.props.selected && (event.target as any).tagName.toUpperCase() === 'TEXTAREA') {
      return;
    }

    // ignore right clicks
    if (event.nativeEvent.which === 3) {
      return;
    }
    if (this.props.onDragStart) {
      this.props.onDragStart(
        this.props.uuid,
        newPosition(event.pageX - this.props.position.left, event.pageY - this.props.position.top)
      );
    }
  }

  public render(): JSX.Element {
    const classes = [styles.draggable];

    if (this.props.selected) {
      classes.push(styles.selected);
    }

    const handleAnimated = () => {
      if (this.props.onAnimated) {
        this.props.onAnimated(this.props.uuid);
      }
    };

    return (
      <div
        data-testid={'draggable_' + this.props.uuid}
        onTransitionEnd={handleAnimated}
        ref={this.ref}
        className={classes.join(' ')}
        style={{
          left: this.props.position.left,
          top: this.props.position.top
        }}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
      >
        {this.props.elementCreator(this.props)}
      </div>
    );
  }
}
