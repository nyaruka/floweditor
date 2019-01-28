import { Canvas, CANVAS_PADDING, CanvasProps } from '~/components/canvas/Canvas';
import { CanvasDraggableProps } from '~/components/canvas/CanvasDraggable';
import { composeComponentTestUtils, mock } from '~/testUtils';
import * as utils from '~/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const ele = (selected: boolean): JSX.Element => null;

const baseProps: CanvasProps = {
    uuid: utils.createUUID(),
    dragActive: false,
    onDragged: jest.fn(),
    onUpdateDragPositions: jest.fn(),
    mergeEditorState: jest.fn(),
    draggables: []
};

const { setup } = composeComponentTestUtils(Canvas, baseProps);

describe(Canvas.name, () => {
    it('render default', () => {
        const { wrapper } = setup();
        expect(wrapper).toMatchSnapshot();
    });

    it('initializes the height to 1000', () => {
        const { instance } = setup();
        expect(instance.state.height).toEqual(1000);
    });

    it('initializes the height to the lowest draggable', () => {
        const lowest: CanvasDraggableProps = {
            ele,
            uuid: utils.createUUID(),
            position: { top: 1200, left: 100, bottom: 1290, right: 300 }
        };

        const { instance } = setup(true, { $set: { draggables: [lowest] } });
        expect(instance.state.height).toEqual(1290 + CANVAS_PADDING);
    });

    it('adjust the height when updating dimensions', () => {
        const lowest: CanvasDraggableProps = {
            ele,
            uuid: utils.createUUID(),
            position: { top: 1200, left: 100 }
        };
        const { instance } = setup(true, { $set: { draggables: [lowest] } });
        expect(instance.state.height).toEqual(1000);

        instance.handleUpdateDimensions(lowest.uuid, { width: 200, height: 300 });
        expect(instance.state.height).toBe(lowest.position.top + 300 + CANVAS_PADDING);
    });
});
