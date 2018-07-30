import { DraggableStyle } from 'react-beautiful-dnd';
import { v4 as generateUUID } from 'uuid';
import { CaseProps, DragCursor } from '~/components/flow/routers/caselist/CaseList';
import { Operators } from '~/config/operatorConfigs';
import { Case, Exit } from '~/flowTypes';

export const getExitName = (kase: Case, exits: Exit[]) => {
    const match = exits.find((exit: Exit) => exit.uuid === kase.exit_uuid);
    if (match) {
        return match.name;
    }
    return '';
};

export const createEmptyCase = (): CaseProps => {
    const uuid = generateUUID();
    return {
        uuid,
        kase: {
            uuid,
            type: Operators.has_any_word,
            arguments: [''],
            exit_uuid: null
        },
        exitName: ''
    };
};

export const getItemStyle = (
    draggableStyle: DraggableStyle,
    isDragging: boolean
): DraggableStyle => ({
    userSelect: 'none',
    outline: 'none',
    ...draggableStyle,
    // Overwriting default draggableStyle object from this point down
    ...(isDragging
        ? {
              background: '#f2f9fc',
              borderRadius: 4,
              opacity: 0.75,
              height: draggableStyle.height + 15
          }
        : {})
});

export const getListStyle = (isDraggingOver: boolean, single: boolean): { cursor: DragCursor } => {
    if (single) {
        return null;
    }

    return {
        cursor: isDraggingOver ? DragCursor.move : DragCursor.pointer
    };
};
