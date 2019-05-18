import { react as bindCallbacks } from 'auto-bind';
import { Dimensions, FlowPosition } from 'flowTypes';
import * as React from 'react';
import { newPosition } from 'store/helpers';

import styles from './CanvasDraggable.module.scss';

export interface CanvasDraggableProps {
  position: FlowPosition;
  uuid: string;
  ele: (selected: boolean) => JSX.Element;

  selected?: boolean;

  onAnimated?: (uuid: string) => void;
  updateDimensions?: (uuid: string, position: Dimensions) => void;
  onDragStart?: (uuid: string, clickedPosition: FlowPosition) => void;
  onDragStop?: () => void;
}

export class CanvasDraggable extends React.PureComponent<
  CanvasDraggableProps,
  {}
> {
  private ele!: HTMLDivElement;

  constructor(props: CanvasDraggableProps) {
    super(props);
    bindCallbacks(this, {
      include: [/^handle/, "ref"]
    });
  }

  private ref(ref: HTMLDivElement): any {
    return (this.ele = ref);
  }

  public componentDidMount(): void {
    if (this.ele) {
      if (this.ele.clientWidth && this.ele.clientHeight) {
        if (this.props.updateDimensions) {
          this.props.updateDimensions(this.props.uuid, {
            width: this.ele.clientWidth,
            height: this.ele.clientHeight
          });
        }
      }
    }
  }

  public componentDidUpdate(prevProps: CanvasDraggableProps): void {
    if (this.ele) {
      if (this.ele.clientWidth && this.ele.clientHeight) {
        if (this.props.updateDimensions) {
          this.props.updateDimensions(this.props.uuid, {
            width: this.ele.clientWidth,
            height: this.ele.clientHeight
          });
        }
      }
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
        onTransitionEnd={handleAnimated}
        ref={this.ref}
        className={classes.join(" ")}
        style={{ left: this.props.position.left, top: this.props.position.top }}
        onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
          // ignore right clicks
          if (event.nativeEvent.which === 3) {
            return;
          }
          if (this.props.onDragStart) {
            this.props.onDragStart(
              this.props.uuid,
              newPosition(
                event.pageX - this.props.position.left,
                event.pageY - this.props.position.top
              )
            );
          }
        }}
        onMouseUp={(event: React.MouseEvent<HTMLDivElement>) => {
          if (event.nativeEvent.which === 3) {
            return;
          }
          if (this.props.onDragStop) {
            this.props.onDragStop();
          }
        }}
      >
        {this.props.ele(this.props.selected!)}
      </div>
    );
  }
}
