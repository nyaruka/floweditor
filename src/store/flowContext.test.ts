import { FlowDefinition } from '../flowTypes';
import Localization from '../services/Localization';
import { configProviderContext } from '../testUtils';
import Constants from './constants';
import reducer, {
    definition as definitionReducer,
    dependencies as dependenciesReducer,
    initialState,
    incrementSuggestedResultNameCount,
    nodes as nodesReducer,
    RenderNodeMap,
    resultNames as resultNamesReducer,
    suggestedResultNameCount as suggestedResultNameCountReducer,
    updateDefinition,
    updateDependencies,
    updateResultNames,
    updateNodes
} from './flowContext';

const boringFlow = require('../../__test__/flows/boring.json') as FlowDefinition;
const emptyFlow = require('../../__test__/flows/empty.json') as FlowDefinition;

const resultNames = {
    'ecc70717-dd25-4795-8dc2-0361265a1e29': {
        name: '@run.results.color',
        description: 'Result for "color"'
    }
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

    describe('updateDependencies', () => {
        it('should create an action to update dependencies state', () => {
            const dependencies = [emptyFlow];
            const expectedAction = {
                type: Constants.UPDATE_DEPENDENCIES,
                payload: {
                    dependencies
                }
            };

            expect(updateDependencies(dependencies)).toEqual(expectedAction);
        });
    });

    describe('updateResultNames', () => {
        it('should create an action to update resultNames state', () => {
            const expectedAction = {
                type: Constants.UPDATE_RESULT_NAMES,
                payload: {
                    resultNames
                }
            };

            expect(updateResultNames(resultNames)).toEqual(expectedAction);
        });
    });

    describe('incrementSuggestedResultNameCount', () => {
        it('should create an action to increment suggestedResultNameCount state', () => {
            const expectedAction = {
                type: Constants.INCREMENT_SUGGESTED_RESULT_NAME_COUNT
            };

            expect(incrementSuggestedResultNameCount()).toEqual(expectedAction);
        });
    });
});

describe('flowContext reducers', () => {
    describe('definition reducer', () => {
        const reduce = action => definitionReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.definition);
        });

        it('should handle UPDATE_DEFINITION', () => {
            const action = updateDefinition(emptyFlow);
            expect(reduce(action)).toEqual(emptyFlow);
        });
    });

    describe('dependencies reducer', () => {
        const reduce = action => dependenciesReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.dependencies);
        });

        it('should handle UPDATE_DEPENDENCIES', () => {
            const dependencies = [emptyFlow];
            const action = updateDependencies(dependencies);

            expect(reduce(action)).toEqual(dependencies);
        });
    });

    describe('resultNames reducer', () => {
        const reduce = action => resultNamesReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.resultNames);
        });

        it('should handle UPDATE_RESULT_NAMES', () => {
            const action = updateResultNames(resultNames);

            expect(reduce(action)).toEqual(resultNames);
        });
    });

    describe('suggestedResultNameCount reducer', () => {
        const reduce = action => suggestedResultNameCountReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.suggestedResultNameCount);
        });

        it('should handle UPDATE_RESULT_NAMES', () => {
            const action = incrementSuggestedResultNameCount();

            expect(reduce(action)).toBe(2);
        });
    });

    describe('nodes reducer', () => {
        const reduce = action => nodesReducer(undefined, action);

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
