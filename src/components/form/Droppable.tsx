import * as React from 'react';
import { DragTypes } from './Draggable';
import { DropTarget, DragDropContext, DropTargetSpec, DropTargetConnector } from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';

const flow = require('lodash.flow');

export interface DroppableChildProps {
    connectDropTarget: Function;
}

const Droppable: React.SFC = props => {
    const { children, ...rest }: any = props;
    return children(rest);
};

const caseTarget: DropTargetSpec<{}> = {
    hover(props: any, monitor: any) {}
};

// prettier-ignore
export default flow(
    DropTarget(
        DragTypes.CASE,
        caseTarget,
        (connect: DropTargetConnector) => ({
            connectDropTarget: connect.dropTarget()
        })
    ),
    DragDropContext(
        TouchBackend({
            enableMouseEvents: true,
            /** Drag should end when user presses 'esc' key. */
            enableKeyboardEvents: true
        })
    )
)(Droppable);
