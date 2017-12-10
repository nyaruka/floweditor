import * as React from 'react';
import { DragTypes } from './Draggable';
import { DropTarget, DragDropContext, DropTargetSpec, DropTargetConnector } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';

const flow = require('lodash.flow');

export interface DroppableChildProps {
    connectDropTarget: Function;
    render: Function;
}

const Droppable: React.SFC = props => {
    const { render, ...rest }: any = props;
    return render(rest);
};

const caseTarget: DropTargetSpec<{}> = {
    hover(props: any, monitor: any) {}
};

export default flow(
    // prettier-ignore
    DropTarget(
        DragTypes.CASE,
        caseTarget,
        (connect: DropTargetConnector) => ({
            connectDropTarget: connect.dropTarget()
        })
    ),
    DragDropContext(
        MultiBackend({
            backends: [
                {
                    backend: HTML5Backend
                },
                {
                    backend: TouchBackend({
                        enableMouseEvents: true,
                        /** Drag should end when user presses 'esc' key. */
                        enableKeyboardEvents: true
                    }),
                    preview: true
                }
            ]
        })
    )
)(Droppable);
