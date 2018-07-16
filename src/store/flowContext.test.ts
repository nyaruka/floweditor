import { FlowDefinition } from '~/flowTypes';
import { English, Spanish } from '~/testUtils/assetCreators';

import Constants from '~/store/constants';
import reducer, {
    definition as definitionReducer,
    dependencies as dependenciesReducer,
    incrementSuggestedResultNameCount,
    initialState,
    nodes as nodesReducer,
    RenderNodeMap,
    resultMap as resultMapReducer,
    suggestedNameCount as suggestedNameCountReducer,
    updateBaseLanguage,
    updateDefinition,
    updateDependencies,
    updateLanguages,
    updateNodes,
    updateResultMap
} from '~/store/flowContext';

const boringFlow = require('~/test/flows/boring.json') as FlowDefinition;
const emptyFlow = require('~/test/flows/empty.json') as FlowDefinition;

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

    describe('updateResultMap', () => {
        it('should create an action to update resultMap state', () => {
            const expectedAction = {
                type: Constants.UPDATE_RESULT_MAP,
                payload: {
                    resultMap: results
                }
            };

            expect(updateResultMap(results)).toEqual(expectedAction);
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
        const reduce = (action: any) => definitionReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.definition);
        });

        it('should handle UPDATE_DEFINITION', () => {
            const action = updateDefinition(emptyFlow);
            expect(reduce(action)).toEqual(emptyFlow);
        });
    });

    describe('dependencies reducer', () => {
        const reduce = (action: any) => dependenciesReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.dependencies);
        });

        it('should handle UPDATE_DEPENDENCIES', () => {
            const dependencies = [emptyFlow];
            const action = updateDependencies(dependencies);

            expect(reduce(action)).toEqual(dependencies);
        });
    });

    describe('resultMap reducer', () => {
        const reduce = (action: any) => resultMapReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.results.resultMap);
        });

        it('should handle UPDATE_RESULTS', () => {
            const action = updateResultMap(results);

            expect(reduce(action)).toEqual(results);
        });
    });

    describe('suggestedNameCount reducer', () => {
        const reduce = (action: any) => suggestedNameCountReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.results.suggestedNameCount);
        });

        it('should handle UPDATE_RESULTS', () => {
            const action = incrementSuggestedResultNameCount();

            expect(reduce(action)).toBe(2);
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
