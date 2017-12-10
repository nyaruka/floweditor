import * as React from 'react';
import {
    DragSource,
    DropTarget,
    DragSourceMonitor,
    DropTargetMonitor,
    DropTargetConnector,
    DragSourceConnector,
    DragSourceSpec,
    DropTargetSpec
} from 'react-dnd';
import { CaseElementProps } from './CaseElement';

const flow = require('lodash.flow');

export enum DragTypes {
    CASE = 'CASE'
}

export interface DraggableProps {
    id: number;
    findCase: Function;
    moveCase: Function;
    render: Function;
}

export interface DraggableChildProps {
    connectDragSource: Function;
    connectDropTarget: Function;
    canDrag: boolean;
    isOver: boolean;
    draggingCase: any;
}

const Draggable: React.SFC<DraggableProps> = props => {
    const { render, ...rest } = props;
    return render(rest);
};

const caseSource: DragSourceSpec<DraggableProps> = {
    beginDrag(props: DraggableProps) {
        return {
            id: props.id,
            originalIndex: props.findCase(props.id).index
        };
    },
    endDrag(props: DraggableProps, monitor: DragSourceMonitor) {
        const { id: droppedId, originalIndex } = monitor.getItem() as {
            id: number;
            originalIndex: number;
        };
        const didDrop = monitor.didDrop();

        if (!didDrop) {
            props.moveCase(droppedId, originalIndex);
        }
    }
};

const caseTarget: DropTargetSpec<DraggableProps> = {
    canDrop() {
        return false;
    },
    hover(props: DraggableProps, monitor: DropTargetMonitor) {
        const { id: draggingId } = monitor.getItem() as { id: number };
        const { id: overId } = props;

        if (draggingId !== overId) {
            const { index: overIndex } = props.findCase(overId);
            props.moveCase(draggingId, overIndex);
        }
    }
};

// prettier-ignore
export default flow(
    DragSource(
        DragTypes.CASE,
        caseSource,
        (connect: DragSourceConnector, monitor: DragSourceMonitor) => ({
            connectDragSource: connect.dragSource(),
            canDrag: monitor.canDrag(),
            draggingCase: monitor.getItem()
        })
    ),
    DropTarget(
        DragTypes.CASE,
        caseTarget,
        (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
            connectDropTarget: connect.dropTarget(),
            isOver: monitor.isOver()
        })
    ),
)(Draggable);
