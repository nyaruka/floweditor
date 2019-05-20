import { Canvas, CANVAS_PADDING, CanvasProps } from 'components/canvas/Canvas';
import { CanvasDraggableProps } from 'components/canvas/CanvasDraggable';
import React from 'react';
import { fireEvent, render } from 'react-testing-library';
import { createUUID } from 'utils';

const ele = (selected: boolean): JSX.Element => <div>I am a draggable element</div>;

const baseProps: CanvasProps = {
  uuid: createUUID(),
  draggingNew: false,
  dragActive: false,
  onDragging: jest.fn(),
  onUpdatePositions: jest.fn(),
  mergeEditorState: jest.fn(),
  onRemoveNodes: jest.fn(),
  draggables: []
};

describe(Canvas.name, () => {
  it('render default', () => {
    const { baseElement } = render(<Canvas {...baseProps} />);
    expect(baseElement).toMatchSnapshot();
  });

  it('initializes the height to the lowest draggable', () => {
    const lowest: CanvasDraggableProps = {
      ele,
      uuid: createUUID(),
      position: { top: 1200, left: 100, bottom: 1290, right: 300 }
    };
    const { baseElement, getByTestId } = render(<Canvas {...baseProps} draggables={[lowest]} />);
    expect(getByTestId('canvas').style.height).toBe(1290 + CANVAS_PADDING + 'px');
    expect(baseElement).toMatchSnapshot();
  });

  it('adjusts the height when updating dimensions', () => {
    const uuid = createUUID();
    const lowest: CanvasDraggableProps = {
      ele,
      uuid,
      position: { top: 1200, left: 100, right: 200, bottom: 1400 }
    };

    const { baseElement, getByTestId } = render(<Canvas {...baseProps} draggables={[lowest]} />);
    expect(getByTestId('canvas').style.height).toBe(lowest.position.bottom + CANVAS_PADDING + 'px');
    expect(baseElement).toMatchSnapshot();
  });

  it('reflows collisions', () => {
    jest.useFakeTimers();

    const first: CanvasDraggableProps = {
      ele,
      uuid: createUUID(),
      position: { top: 100, bottom: 200, left: 100, right: 200 }
    };

    const second: CanvasDraggableProps = {
      ele,
      uuid: createUUID(),
      position: { top: 150, left: 100, bottom: 250, right: 200 }
    };

    const onDragging = jest.fn();

    const { getByTestId } = render(
      <Canvas {...baseProps} draggables={[first, second]} onDragging={onDragging} />
    );

    // trigger reflow by simulating a drag event
    fireEvent.mouseDown(getByTestId('draggable_' + first.uuid));
    fireEvent.mouseUp(getByTestId('draggable_' + first.uuid));
    jest.runAllTimers();

    expect(onDragging).toMatchCallSnapshot();
  });
});
