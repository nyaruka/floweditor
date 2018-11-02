import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { FlowPosition } from '~/flowTypes';
import { newPosition } from '~/store/helpers';

import * as styles from './CanvasDraggable.scss';

export interface CanvasDraggableProps {
    position: FlowPosition;
    uuid: string;
    ele: JSX.Element;

    selected?: boolean;
    onDragStart?: (uuid: string, clickedPosition: FlowPosition) => void;
    onDragStop?: () => void;
}

export class CanvasDraggable extends React.Component<CanvasDraggableProps, {}> {
    constructor(props: CanvasDraggableProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    public render(): JSX.Element {
        const classes = [styles.draggable];

        if (this.props.selected) {
            classes.push(styles.selected);
        }

        return (
            <div
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
                {this.props.ele}
            </div>
        );
    }
}
