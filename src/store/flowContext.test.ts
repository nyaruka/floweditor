import Localization from '../services/Localization';
import Constants from './constants';
import { v4 as generateUUID } from 'uuid';
import reducer, {
    contactFields as contactFieldsReducer,
    definition as definitionReducer,
    dependencies as dependenciesReducer,
    groups as groupsReducer,
    initialState,
    localizations as localizationsReducer,
    resultNames as resultNamesReducer,
    nodes as nodesReducer,
    updateContactFields,
    updateDefinition,
    updateDependencies,
    updateGroups,
    updateLocalizations,
    updateResultNames,
    updateNodes,
    RenderNodeMap
} from './flowContext';
import { configProviderContext } from '../testUtils';
import { FlowDefinition } from '../flowTypes';
import { Types } from '../config/typeConfigs';

const colorsFlow = require('../../__test__/flows/colors.json') as FlowDefinition;
const customerServiceFlow = require('../../__test__/flows/customer_service.json') as FlowDefinition;

describe('flowContext action creators', () => {
    describe('updateDefinition', () => {
        it('should create an action to update definition state', () => {
            const expectedAction = {
                type: Constants.UPDATE_DEFINITION,
                payload: {
                    definition: colorsFlow
                }
            };

            expect(updateDefinition(colorsFlow)).toEqual(expectedAction);
        });
    });

    describe('updateDependencies', () => {
        it('should create an action to update dependencies state', () => {
            const dependencies = [colorsFlow, customerServiceFlow];
            const expectedAction = {
                type: Constants.UPDATE_DEPENDENCIES,
                payload: {
                    dependencies
                }
            };

            expect(updateDependencies(dependencies)).toEqual(expectedAction);
        });
    });

    describe('updateLocalizations', () => {
        it('should create an action to update localizations state', () => {
            const iso = 'spa';
            const localizations = [
                Localization.translate(
                    colorsFlow.nodes[0].actions[0],
                    iso,
                    configProviderContext.languages,
                    colorsFlow[iso]
                )
            ];
            const expectedAction = {
                type: Constants.UPDATE_LOCALIZATIONS,
                payload: {
                    localizations
                }
            };

            expect(updateLocalizations(localizations)).toEqual(expectedAction);
        });
    });

    describe('updateContactFields', () => {
        it('should create an action to update contactFields state', () => {
            const contactField = {
                id: generateUUID(),
                name: 'Name',
                type: Types.set_contact_field
            };
            const expectedAction = {
                type: Constants.UPDATE_CONTACT_FIELDS,
                payload: {
                    contactField
                }
            };

            expect(updateContactFields(contactField)).toEqual(expectedAction);
        });
    });

    describe('updateGroups', () => {
        it('should create an action to update groups state', () => {
            const group = { id: 'subscribers', name: 'Subscribers' };
            const expectedAction = {
                type: Constants.UPDATE_GROUPS,
                payload: {
                    group
                }
            };

            expect(updateGroups(group)).toEqual(expectedAction);
        });
    });

    describe('updateResultNames', () => {
        it('should create an action to update resultNames state', () => {
            const resultNames = [{ name: 'run.results.color', description: 'Result for "color"' }];
            const expectedAction = {
                type: Constants.UPDATE_RESULT_NAMES,
                payload: {
                    resultNames
                }
            };

            expect(updateResultNames(resultNames)).toEqual(expectedAction);
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
            const action = updateDefinition(colorsFlow);

            expect(reduce(action)).toEqual(colorsFlow);
        });
    });

    describe('dependencies reducer', () => {
        const reduce = action => dependenciesReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.dependencies);
        });

        it('should handle UPDATE_DEPENDENCIES', () => {
            const dependencies = [colorsFlow, customerServiceFlow];
            const action = updateDependencies(dependencies);

            expect(reduce(action)).toEqual(dependencies);
        });
    });

    describe('localizations reducer', () => {
        const reduce = action => localizationsReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.localizations);
        });

        it('should handle UPDATE_LOCALIZATIONS', () => {
            const iso = 'spa';
            const localizations = [
                Localization.translate(
                    colorsFlow.nodes[0].actions[0],
                    iso,
                    configProviderContext.languages,
                    colorsFlow[iso]
                )
            ];
            const action = updateLocalizations(localizations);

            expect(reduce(action)).toEqual(localizations);
        });
    });

    describe('contactFields reducer', () => {
        const reduce = action => contactFieldsReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.contactFields);
        });

        it('should handle UPDATE_CONTACT_FIELDS', () => {
            const contactFields = {
                id: generateUUID(),
                name: 'Name',
                type: Types.set_contact_field
            };
            const action = updateContactFields(contactFields);

            expect(reduce(action)).toEqual([contactFields]);
        });
    });

    describe('resultNames reducer', () => {
        const reduce = action => resultNamesReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.resultNames);
        });

        it('should handle UPDATE_RESULT_NAMES', () => {
            const resultNames = [{ name: 'run.results.color', description: 'Result for "color"' }];
            const action = updateResultNames(resultNames);

            expect(reduce(action)).toEqual(resultNames);
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

    describe('groups reducer', () => {
        const reduce = action => groupsReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.groups);
        });

        it('should handle UPDATE_GROUPS', () => {
            const groups = { id: 'subscribers', name: 'Subscribers' };
            const action = updateGroups(groups);

            expect(reduce(action)).toEqual([groups]);
        });
    });
});
