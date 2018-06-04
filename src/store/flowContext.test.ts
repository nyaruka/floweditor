import { FlowDefinition } from '../flowTypes';
import Constants from './constants';
import reducer, {
    definition as definitionReducer,
    dependencies as dependenciesReducer,
    incrementSuggestedResultNameCount,
    initialState,
    nodes as nodesReducer,
    RenderNodeMap,
    results as resultNamesReducer,
    suggestedResultNameCount as suggestedResultNameCountReducer,
    updateDefinition,
    updateDependencies,
    updateNodes,
    updateResults,
} from './flowContext';

const boringFlow = require('../../__test__/flows/boring.json') as FlowDefinition;
const emptyFlow = require('../../__test__/flows/empty.json') as FlowDefinition;

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

    describe('updateResults', () => {
        it('should create an action to update resultNames state', () => {
            const expectedAction = {
                type: Constants.UPDATE_RESULTS,
                payload: {
                    results
                }
            };

            expect(updateResults(results)).toEqual(expectedAction);
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

    describe('results reducer', () => {
        const reduce = action => resultNamesReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.results);
        });

        it('should handle UPDATE_RESULTS', () => {
            const action = updateResults(results);

            expect(reduce(action)).toEqual(results);
        });
    });

    describe('suggestedResultNameCount reducer', () => {
        const reduce = action => suggestedResultNameCountReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.suggestedResultNameCount);
        });

        it('should handle UPDATE_RESULTS', () => {
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
