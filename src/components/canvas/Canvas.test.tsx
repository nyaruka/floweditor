import { Canvas, CANVAS_PADDING, CanvasProps } from 'components/canvas/Canvas';
import { CanvasDraggableProps } from 'components/canvas/CanvasDraggable';
import { getOrderedDraggables } from 'components/canvas/helpers';
import React from 'react';
import { render } from 'react-testing-library';
import { composeComponentTestUtils, mock } from 'testUtils';
import * as utils from 'utils';

mock(utils, "createUUID", utils.seededUUIDs());

const ele = (selected: boolean): JSX.Element => null;

const baseProps: CanvasProps = {
  uuid: utils.createUUID(),
  draggingNew: false,
  dragActive: false,
  onDragging: jest.fn(),
  onUpdatePositions: jest.fn(),
  mergeEditorState: jest.fn(),
  onRemoveNodes: jest.fn(),
  draggables: []
};

const { setup } = composeComponentTestUtils(Canvas, baseProps);

describe(Canvas.name, () => {
  it("render default", () => {
    // const { wrapper } = setup();
    const { container } = render(<Canvas {...baseProps} />);

    expect(container).toMatchSnapshot();
  });

  it("initializes the height to 1000", () => {
    const { instance } = setup();

    expect(instance.state.height).toEqual(0);
  });

  it("initializes the height to the lowest draggable", () => {
    const lowest: CanvasDraggableProps = {
      ele,
      uuid: utils.createUUID(),
      position: { top: 1200, left: 100, bottom: 1290, right: 300 }
    };

    const { instance } = setup(true, { $merge: { draggables: [lowest] } });
    expect(instance.state.height).toEqual(1290 + CANVAS_PADDING);
  });

  it("adjust the height when updating dimensions", () => {
    const lowest: CanvasDraggableProps = {
      ele,
      uuid: utils.createUUID(),
      position: { top: 1200, left: 100 }
    };
    const { instance } = setup(true, { $merge: { draggables: [lowest] } });
    expect(instance.state.height).toEqual(0);

    instance.handleUpdateDimensions(lowest.uuid, { width: 200, height: 300 });
    expect(instance.state.height).toBe(
      lowest.position.top + 300 + CANVAS_PADDING
    );
  });

  it("reflows collisions", () => {
    const first: CanvasDraggableProps = {
      ele,
      uuid: utils.createUUID(),
      position: { top: 100, bottom: 200, left: 100, right: 200 }
    };

    const second: CanvasDraggableProps = {
      ele,
      uuid: utils.createUUID(),
      position: { top: 150, left: 100, bottom: 250, right: 200 }
    };

    const { instance } = setup(true, {
      $merge: { draggables: [first, second] }
    });

    instance.doReflow();

    const ordered = getOrderedDraggables(instance.state.positions);
    expect(ordered[0].uuid).toBe(first.uuid);
    expect(ordered[1].uuid).toBe(second.uuid);

    expect(instance.state.positions).toMatchSnapshot();
  });
});
