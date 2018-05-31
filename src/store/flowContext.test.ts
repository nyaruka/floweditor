import { FlowDefinition } from '../flowTypes';
import { English, Spanish } from '../testUtils/assetCreators';
import Constants from './constants';
import reducer, {
    completionOptions as resultNamesReducer,
    definition as definitionReducer,
    dependencies as dependenciesReducer,
    incrementSuggestedResultNameCount,
    initialState,
    nodes as nodesReducer,
    RenderNodeMap,
    suggestedNameCount as suggestedResultNameCountReducer,
    updateBaseLanguage,
    updateDefinition,
    updateDependencies,
    updateLanguages,
    updateNodes,
    updateResultCompletionOptions,
} from './flowContext';

const boringFlow = require('../../__test__/flows/boring.json') as FlowDefinition;
const emptyFlow = require('../../__test__/flows/empty.json') as FlowDefinition;

const resultsCompletionMap = {
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

    describe('updateResultCompletionOptions', () => {
        it('should create an action to update resultNames state', () => {
            const expectedAction = {
                type: Constants.UPDATE_RESULT_COMPLETION_OPTIONS,
                payload: {
                    completionOptions: resultsCompletionMap
                }
            };

            expect(updateResultCompletionOptions(resultsCompletionMap)).toEqual(expectedAction);
        });
    });

    describe('incrementSuggestedResultNameCount', () => {
        it('should create an action to increment suggestedNameCount state', () => {
            const expectedAction = {
                type: Constants.INCREMENT_SUGGESTED_RESULT_NAME_COUNT
            };

            expect(incrementSuggestedResultNameCount()).toEqual(expectedAction);
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

    describe('updateLanguages', () => {
        it('should create an action to update base language', () => {
            const languages = [English, Spanish];
            const expectedAction = {
                type: Constants.UPDATE_LANGUAGES,
                payload: {
                    languages
                }
            };

            expect(updateLanguages(languages)).toEqual(expectedAction);
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

    describe('completionOptions reducer', () => {
        const reduce = action => resultNamesReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.results.completionOptions);
        });

        it('should handle UPDATE_RESULT_COMPLETION_OPTIONS', () => {
            const action = updateResultCompletionOptions(resultsCompletionMap);

            expect(reduce(action)).toEqual(resultsCompletionMap);
        });
    });

    describe('suggestedNameCount reducer', () => {
        const reduce = action => suggestedResultNameCountReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.results.suggestedNameCount);
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
