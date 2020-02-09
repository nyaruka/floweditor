import { FlowDefinition } from 'flowTypes';
import Constants from 'store/constants';
import reducer, {
  definition as definitionReducer,
  initialState,
  nodes as nodesReducer,
  RenderNodeMap,
  updateBaseLanguage,
  updateDefinition,
  updateNodes
} from 'store/flowContext';
import { English } from 'testUtils/assetCreators';

const boringFlow = require('test/flows/boring.json') as FlowDefinition;
const emptyFlow = require('test/flows/empty.json') as FlowDefinition;

const results = {
  'ecc70717-dd25-4795-8dc2-0361265a1e29': '@run.results.color'
};

describe('flowContext action creators', () => {
  describe('updateDefinition', () => {
    it('should create an action to update definition state', () => {
      const expectedAction = {
        type: Constants.UPDATE_DEFINITION,
        payload: {
          definition: boringFlow
        }
      };

      expect(updateDefinition(boringFlow)).toEqual(expectedAction);
    });
  });

  describe('updateBaseLanguage', () => {
    it('should create an action to update base language', () => {
      const expectedAction = {
        type: Constants.UPDATE_BASE_LANGUAGE,
        payload: {
          baseLanguage: English
        }
      };

      expect(updateBaseLanguage(English)).toEqual(expectedAction);
    });
  });
});

describe('flowContext reducers', () => {
  describe('definition reducer', () => {
    const reduce = (action: any) => definitionReducer(undefined, action);

    it('should return initial state', () => {
      expect(reduce({})).toEqual(initialState.definition);
    });

    it('should handle UPDATE_DEFINITION', () => {
      const action = updateDefinition(emptyFlow);
      expect(reduce(action)).toEqual(emptyFlow);
    });
  });

  describe('nodes reducer', () => {
    const reduce = (action: any) => nodesReducer(undefined, action);

    it('should return initial state', () => {
      expect(reduce({})).toEqual(initialState.nodes);
    });

    it('should handle UPDATE_NODES', () => {
      const nodes: RenderNodeMap = {
        nodeA: {
          node: { uuid: 'nodeA', actions: [], exits: [] },
          ui: { position: { left: 100, top: 100 } },
          inboundConnections: {}
        }
      };
      const action = updateNodes(nodes);

      expect(reduce(action)).toEqual(nodes);
    });
  });
});
