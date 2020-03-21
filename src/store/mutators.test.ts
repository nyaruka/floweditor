import { Types } from 'config/interfaces';
import { Category, Exit, FlowDefinition, RouterTypes, SendMsg } from 'flowTypes';
import { RenderNode, AssetMap, AssetType } from 'store/flowContext';
import {
  detectLoops,
  getActionIndex,
  getExitIndex,
  getFlowComponents,
  getNode,
  newPosition
} from 'store/helpers';
import {
  addAction,
  mergeNode,
  moveActionUp,
  removeAction,
  removeConnection,
  removeNode,
  updateAction,
  updateConnection,
  updateLocalization,
  updateNodeDimensions,
  updatePosition,
  removeResultReference,
  removeResultFromStore
} from 'store/mutators';
import { createMatchRouter, createSendMsgAction } from 'testUtils/assetCreators';
import { createUUID } from 'utils';

const mutate = require('immutability-helper');

describe('mutators', () => {
  const definition: FlowDefinition = require('test/flows/boring.json');
  const { renderNodeMap: nodes } = getFlowComponents(definition);

  it('should throw for missing nodes', () => {
    expect(() => {
      getNode(nodes, 'missing-node');
    }).toThrowError('Cannot find node missing-node');
  });

  it('should throw for missing exits', () => {
    expect(() => {
      getExitIndex(nodes.node0.node, 'missing-exit');
    }).toThrowError('Cannot find exit missing-exit');
  });

  it('should throw for missing actions', () => {
    expect(() => {
      getActionIndex(nodes.node0.node, 'missing-action');
    }).toThrowError('Cannot find action missing-action');
  });

  describe('updateConnection()', () => {
    it('should update connections', () => {
      const updated = updateConnection(nodes, 'node0', 'node0_exit0', 'node2');
      expect(updated.node0.node.exits[0].destination_uuid).toBe('node2');
      expect(updated).toMatchSnapshot();
    });

    it('should allow clearing connection', () => {
      const updated = updateConnection(nodes, 'node0', 'node0_exit0', null);
      expect(updated.node0.node.exits[0].destination_uuid).toBeNull();
      expect(updated).toMatchSnapshot();
    });

    it('should update without a previous destination', () => {
      const updated = updateConnection(nodes, 'node2', 'node2_exit0', 'node0');
      expect(updated.node2.node.exits[0].destination_uuid).toBe('node0');
      expect(updated).toMatchSnapshot();
    });
  });

  it('should removeConnection', () => {
    const updated = removeConnection(nodes, 'node0', 'node0_exit0');
    expect(updated.node0.node.exits[0].destination_uuid).toBeNull();
    expect(updated).toMatchSnapshot();
  });

  it('should addAction', () => {
    const updated = addAction(nodes, 'node0', {
      uuid: 'node0_action4',
      type: Types.send_msg,
      text: 'Hello World'
    } as SendMsg);

    const action = updated.node0.node.actions[5] as SendMsg;
    expect(action.type).toBe(Types.send_msg);
    expect(action.text).toBe('Hello World');
    expect(updated).toMatchSnapshot();
  });

  it('should remove results', () => {
    const nodeUUID = createUUID();
    const items: AssetMap = {
      result_1: {
        name: 'Result 1',
        id: 'result_1',
        type: AssetType.Result,
        references: [{ nodeUUID }]
      }
    };
    const assets = removeResultReference('Result 1', items, { nodeUUID });
    expect(Object.keys(assets).length).toBe(0);
  });

  it('should not add results if they were never there', () => {
    const nodeUUID = createUUID();
    const items: AssetMap = {};
    const assets = removeResultReference('Result 1', items, { nodeUUID });
    expect(Object.keys(assets).length).toBe(0);
  });

  describe('updateAction()', () => {
    it('should update an action that was added', () => {
      const originalAction = {
        uuid: 'node0_action3',
        type: Types.send_msg,
        text: 'Hello World'
      } as SendMsg;

      const newAction = {
        uuid: 'node0_action3',
        type: Types.send_msg,
        text: 'Goodbye World'
      } as SendMsg;

      let updated = addAction(nodes, 'node0', originalAction);

      updated = updateAction(updated, 'node0', newAction, originalAction);

      // we added one to get to four and then edited it
      expect(updated.node0.node.actions.length).toBe(6);

      const action = updated.node0.node.actions[3] as SendMsg;
      expect(action.type).toBe(Types.send_msg);
      expect(action.text).toBe('Goodbye World');
      expect(updated).toMatchSnapshot();
    });

    it('should add the updated action at the index of the original action', () => {
      const indexToUpdate = 1;
      const newAction = createSendMsgAction();
      const updated = updateAction(
        nodes,
        'node0',
        newAction,
        nodes.node0.node.actions[indexToUpdate]
      );

      expect(updated.node0.node.actions[indexToUpdate]).toEqual(newAction);
    });
  });

  it('should removeAction', () => {
    const updated = removeAction(nodes, 'node0', 'node0_action0');
    expect(updated.node0.node.actions.length).toBe(4);
    expect(updated).toMatchSnapshot();
  });

  describe('moveActionUp()', () => {
    it('should throw if trying to move beyond the top', () => {
      expect(() => {
        const updated = moveActionUp(nodes, 'node0', 'node0_action0');
      }).toThrowError('Cannot move an action at the top upwards');
    });

    it('should move action up', () => {
      const updated = moveActionUp(nodes, 'node0', 'node0_action1');
      expect(updated.node0.node.actions[0].uuid).toBe('node0_action1');
      expect(updated).toMatchSnapshot();
    });
  });

  describe('removeNodeAndRemap()', () => {
    it('should remove action nodes', () => {
      const updated = removeNode(nodes, 'node0');
      expect(updated.node0).toBeUndefined();
      expect(Object.keys(updated.node1.inboundConnections)).not.toContain('node0_exit0');
    });

    it('should remove multi-exit router nodes', () => {
      const updated = removeNode(nodes, 'node1');
      expect(updated.node1).toBeUndefined();
    });
  });

  it('should update an action node to a split', () => {
    const node = {
      ...nodes.node0.node,
      actions: [] as any[],
      router: { type: RouterTypes.switch, categories: [] as Category[] }
    };
    const updated = mergeNode(nodes, {
      node,
      ui: { type: Types.wait_for_response, position: null },
      inboundConnections: {}
    });
    expect(updated.node0.node.router.type).toBe('switch');
    expect(updated.node0.node.actions.length).toBe(0);
    expect(updated.node0.ui.type).toBe('wait_for_response');
  });

  it('should updatePosition()', () => {
    const updated = updatePosition(nodes, 'node0', newPosition(500, 1000));
    expect(updated.node0.ui.position).toEqual({
      left: 500,
      top: 1000
    });
  });

  it('should updateDimensions()', () => {
    const updated = updateNodeDimensions(nodes, 'node0', {
      width: 250,
      height: 350
    });
    expect(updated.node0.ui.position).toEqual({
      left: 0,
      top: 0,
      right: 250,
      bottom: 350
    });
  });

  it('should updateLocalizations', () => {
    let updated = updateLocalization(definition, 'spa', [
      { uuid: 'node0_action0', translations: { text: 'Hola Mundo!' } }
    ]);

    expect(Object.keys(updated.localization)).toContain('spa');
    expect(updated.localization.spa).toEqual({
      node0_action0: { text: ['Hola Mundo!'] }
    });
    expect(updated).toMatchSnapshot();

    // now clear it
    updated = updateLocalization(updated, 'spa', [{ uuid: 'node0_action0', translations: null }]);
    expect(updated.localization.spa).toEqual({});
    expect(updated).toMatchSnapshot();
  });

  describe('loop detection', () => {
    it('should detect loops between action sets', () => {
      const nodeA = createEmptyNode();
      const nodeB = createEmptyNode();

      connect([nodeA, nodeB]);

      const nodeMap = createNodeMap([nodeA, nodeB]);

      // can't point two non-waits in a cycle
      expect(() => {
        detectLoops(nodeMap, nodeB.node.uuid, nodeA.node.uuid);
      }).toThrowError();

      // can't point to ourselves
      expect(() => {
        detectLoops(nodeMap, nodeB.node.uuid, nodeB.node.uuid);
      }).toThrowError();
    });

    it('should allow wait to action and back', () => {
      const actionNode = createEmptyNode();
      const waitNode = createMatchRouter(['Red']);

      // point our action to our wait
      connect([actionNode, waitNode]);

      detectLoops(createNodeMap([actionNode, waitNode]), waitNode.node.uuid, actionNode.node.uuid);
    });

    it('should detect lengthy cycles', () => {
      // create a long chain of non wait nodes
      const nodeList: RenderNode[] = [];
      for (let i = 0; i < 10; i++) {
        nodeList.push(createEmptyNode());
      }

      // chain them together
      connect(nodeList);

      // try a valid connection
      expect(() => {
        detectLoops(
          createNodeMap(nodeList),
          nodeList[nodeList.length - 2].node.uuid,
          nodeList[nodeList.length - 1].node.uuid
        );
      }).not.toThrowError();

      // now try linking the last one to the front
      expect(() => {
        detectLoops(
          createNodeMap(nodeList),
          nodeList[nodeList.length - 1].node.uuid,
          nodeList[0].node.uuid
        );
      }).toThrowError();
    });

    it('should not reroute on removal if it creates a loop', () => {
      let expressionA = createEmptyNode();
      const waitNode = createMatchRouter(['red']);
      const expressionB = createEmptyNode();

      // create a loop with a wait in the middle
      connect([expressionA, waitNode, expressionB, expressionA]);
      const updatedNodes = removeNode(
        createNodeMap([expressionA, waitNode, expressionB]),
        waitNode.node.uuid,
        true
      );

      // expressionA should no no longer have a
      expressionA = updatedNodes[expressionA.node.uuid];
      expect(expressionA.node.exits[0].destination_uuid).toBeFalsy();
    });
  });
});

const connect = (nodes: RenderNode[]): void => {
  for (let i = 0; i < nodes.length; i++) {
    if (i < nodes.length - 1) {
      const fromNode = nodes[i];
      const toNode = nodes[i + 1];
      fromNode.node.exits[0].destination_uuid = toNode.node.uuid;
      toNode.inboundConnections[fromNode.node.exits[0].uuid] = fromNode.node.uuid;
    }
  }
};

const createNodeMap = (nodes: RenderNode[]): any => {
  return nodes
    .map((node: RenderNode) => {
      return { [node.node.uuid]: node };
    })
    .reduce((prev: { [uuid: string]: RenderNode }, next: { [uuid: string]: RenderNode }) => {
      return mutate(prev, { $merge: next });
    });
};

const createEmptyNode = (exitCount: number = 1): RenderNode => {
  const exits: Exit[] = [];
  for (let i = 0; i < exitCount; i++) {
    exits.push({ uuid: createUUID() });
  }

  const renderNode: RenderNode = {
    node: { uuid: createUUID(), actions: [], exits },
    ui: { position: { left: 0, top: 0 } },
    inboundConnections: {}
  };

  return renderNode;
};
