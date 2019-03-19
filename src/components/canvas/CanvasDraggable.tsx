import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { Dimensions, FlowPosition } from '~/flowTypes';
import { newPosition } from '~/store/helpers';

import * as styles from './CanvasDraggable.scss';

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

export class CanvasDraggable extends React.PureComponent<CanvasDraggableProps, {}> {
    private ele: HTMLDivElement;

    constructor(props: CanvasDraggableProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^handle/, 'ref']
        });
    }

    private ref(ref: HTMLDivElement): any {
        return (this.ele = ref);
    }

    public componentDidMount(): void {
        if (this.ele) {
            if (this.ele.clientWidth && this.ele.clientHeight) {
                this.props.updateDimensions(this.props.uuid, {
                    width: this.ele.clientWidth,
                    height: this.ele.clientHeight
                });
            }
        }
    }

    public componentDidUpdate(prevProps: CanvasDraggableProps): void {
        if (this.ele) {
            if (this.ele.clientWidth && this.ele.clientHeight) {
                this.props.updateDimensions(this.props.uuid, {
                    width: this.ele.clientWidth,
                    height: this.ele.clientHeight
                });
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
                className={classes.join(' ')}
                style={{ left: this.props.position.left, top: this.props.position.top }}
                onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
                    this.props.onDragStart(
                        this.props.uuid,
                        newPosition(
                            event.pageX - this.props.position.left,
                            event.pageY - this.props.position.top
                        )
                    );
                }}
                onMouseUp={(event: React.MouseEvent<HTMLDivElement>) => {
                    this.props.onDragStop();
                }}
            >
                {this.props.ele(this.props.selected)}
            </div>
        );
    }
}
