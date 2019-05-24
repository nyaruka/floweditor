import { NodeComp, NodeProps } from 'components/flow/node/Node';
import { Types } from 'config/interfaces';
import React from 'react';
import { render, TEST_DEFINITION, TEST_NODE } from 'test/utils';
import { createUUID } from 'utils';

const baseProps: NodeProps = {
  nodeUUID: createUUID(),
  startingNode: true,
  onlyNode: true,
  selected: false,
  plumberMakeTarget: jest.fn(),
  plumberRecalculate: jest.fn(),
  plumberMakeSource: jest.fn(),
  plumberRemove: jest.fn(),
  plumberConnectExit: jest.fn(),
  plumberUpdateClass: jest.fn(),

  results: {},
  activeCount: 0,
  containerOffset: { top: 0, left: 0 },
  translating: false,
  simulating: false,
  debug: null,
  renderNode: {
    node: TEST_NODE,
    ui: {
      position: { left: 0, top: 0 },
      type: Types.execute_actions
    },
    inboundConnections: {}
  },
  definition: TEST_DEFINITION,
  onAddToNode: jest.fn(),
  onOpenNodeEditor: jest.fn(),
  removeNode: jest.fn(),
  mergeEditorState: jest.fn()
};

describe(NodeComp.name, () => {
  it('renders', () => {
    const { baseElement } = render(<NodeComp {...baseProps} />);
    expect(baseElement).toMatchSnapshot();
  });
});
