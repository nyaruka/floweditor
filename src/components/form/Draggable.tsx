import * as React from 'react';
import { DragSource, DropTarget } from 'react-dnd';

const flow = require('lodash.flow');

export enum DragTypes {
    CASE = 'CASE'
}

export interface DraggableProps {
    id: number;
    findCase: Function;
    moveCase: Function;
}

export interface DraggableChildProps {
    connectDragSource: Function;
    connectDropTarget: Function;
    canDrag: boolean;
    isOver: boolean;
    draggingCase: any;
}

const Draggable: React.SFC<DraggableProps> = (props) => {
    const { children, ...rest }: any = props;
    return children(rest);
};

const caseSource = {
    canDrag(props: any, monitor: any) {
        return props.empty ? false : true;
    },
    beginDrag(props: any) {
        return {
            id: props.id,
            originalIndex: props.findCase(props.id).index
        };
    },
    endDrag(props: any, monitor: any) {
        const { id: droppedId, originalIndex } = monitor.getItem();
        const didDrop = monitor.didDrop();

        if (!didDrop) {
            props.moveCase(droppedId, originalIndex);
        }
    }
};

const caseTarget = {
    canDrop() {
        return false;
    },
    hover(props: any, monitor: any) {
        const { id: draggingId } = monitor.getItem();
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
        (connect, monitor) => ({
            connectDragSource: connect.dragSource(),
            canDrag: monitor.canDrag(),
            draggingCase: monitor.getItem()
        })
    ),
    DropTarget(
        DragTypes.CASE,
        caseTarget,
        (connect, monitor) => ({
            connectDropTarget: connect.dropTarget(),
            isOver: monitor.isOver()
        })
    ),
)(Draggable);
