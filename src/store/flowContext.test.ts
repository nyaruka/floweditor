import Localization from '../services/Localization';
import Constants from './constants';
import reducer, {
    contactFields as contactFieldsReducer,
    definition as definitionReducer,
    dependencies as dependenciesReducer,
    groups as groupsReducer,
    initialState,
    localizations as localizationsReducer,
    resultNames as resultNamesReducer,
    updateContactFields,
    updateDefinition,
    updateDependencies,
    updateGroups,
    updateLocalizations,
    updateResultNames
} from './flowContext';

const colorsFlow = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const customerServiceFlow = require('../../assets/flows/9ecc8e84-6b83-442b-a04a-8094d5de997b.json');
const config = require('../../assets/config');

describe('flowContext action creators', () => {
    describe('updateDefinition', () => {
        it('should create an action to update definition state', () => {
            const { results: [{ definition }] } = colorsFlow;
            const expectedAction = {
                type: Constants.UPDATE_DEFINITION,
                payload: {
                    definition
                }
            };
            expect(updateDefinition(definition)).toEqual(expectedAction);
        });
    });

    describe('updateDependencies', () => {
        it('should create an action to update dependencies state', () => {
            const dependencies = [
                colorsFlow.results[0].definition,
                customerServiceFlow.results[0].definition
            ];
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
            const { definition } = colorsFlow.results[0];
            const iso = 'spa';
            const localizations = [
                Localization.translate(
                    definition.nodes[0].actions[0],
                    iso,
                    config.languages,
                    definition[iso]
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
            const contactFields = [{ id: 'name', name: 'Name', type: 'set_contact_field' }];
            const expectedAction = {
                type: Constants.UPDATE_CONTACT_FIELDS,
                payload: {
                    contactFields
                }
            };
            expect(updateContactFields(contactFields)).toEqual(expectedAction);
        });
    });

    describe('updateGroups', () => {
        it('should create an action to update groups state', () => {
            const groups = [{ id: 'subscribers', name: 'Subscribers' }];
            const expectedAction = {
                type: Constants.UPDATE_GROUPS,
                payload: {
                    groups
                }
            };
            expect(updateGroups(groups)).toEqual(expectedAction);
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

    describe('updateComponents', () => {
        it('should create an action to update components state', () => {
            const components = {
                '4fac7935-d13b-4b36-bf15-98075dca822a': {
                    nodeUUID: '4fac7935-d13b-4b36-bf15-98075dca822a',
                    nodeIdx: 0,
                    actionIdx: -1,
                    exitIdx: -1,
                    pointers: ['326a41b7-9bce-453b-8783-1113f649663c']
                },
                '64378fc1-19e4-4c8a-be27-aee49ebc728a': {
                    nodeUUID: '4fac7935-d13b-4b36-bf15-98075dca822a',
                    nodeIdx: 0,
                    actionUUID: '64378fc1-19e4-4c8a-be27-aee49ebc728a',
                    actionIdx: 0,
                    type: 'send_msg'
                },
                '445fc64c-2a18-47cc-89d0-15172826bfcc': {
                    nodeIdx: 0,
                    nodeUUID: '4fac7935-d13b-4b36-bf15-98075dca822a',
                    exitIdx: 0,
                    exitUUID: '445fc64c-2a18-47cc-89d0-15172826bfcc'
                }
            };
            const expectedAction = {
                type: Constants.UPDATE_COMPONENTS,
                payload: {
                    components
                }
            };
            // expect(updateComponents(components)).toEqual(expectedAction);
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
            const { results: [{ definition }] } = colorsFlow;
            const action = updateDefinition(definition);
            expect(reduce(action)).toEqual(definition);
        });
    });

    describe('dependencies reducer', () => {
        const reduce = action => dependenciesReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.dependencies);
        });

        it('should handle UPDATE_DEPENDENCIES', () => {
            const dependencies = [
                colorsFlow.results[0].definition,
                customerServiceFlow.results[0].definition
            ];
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
            const { definition } = colorsFlow.results[0];
            const iso = 'spa';
            const localizations = [
                Localization.translate(
                    definition.nodes[0].actions[0],
                    iso,
                    config.languages,
                    definition[iso]
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
            const contactFields = [{ id: 'name', name: 'Name', type: 'set_contact_field' }];
            const action = updateContactFields(contactFields);
            expect(reduce(action)).toEqual(contactFields);
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

    describe('groups reducer', () => {
        const reduce = action => groupsReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.groups);
        });

        it('should handle UPDATE_GROUPS', () => {
            const groups = [{ id: 'subscribers', name: 'Subscribers' }];
            const action = updateGroups(groups);
            expect(reduce(action)).toEqual(groups);
        });
    });

    describe('components reducer', () => {
        // const reduce = action => componentsReducer(undefined, action);

        it('should return initial state', () => {
            // expect(reduce({})).toEqual(initialState.components);
        });

        it('should handle UPDATE_COMPONENTS', () => {
            const components = {
                '4fac7935-d13b-4b36-bf15-98075dca822a': {
                    nodeUUID: '4fac7935-d13b-4b36-bf15-98075dca822a',
                    nodeIdx: 0,
                    actionIdx: -1,
                    exitIdx: -1,
                    pointers: ['326a41b7-9bce-453b-8783-1113f649663c']
                },
                '64378fc1-19e4-4c8a-be27-aee49ebc728a': {
                    nodeUUID: '4fac7935-d13b-4b36-bf15-98075dca822a',
                    nodeIdx: 0,
                    actionUUID: '64378fc1-19e4-4c8a-be27-aee49ebc728a',
                    actionIdx: 0,
                    type: 'send_msg'
                },
                '445fc64c-2a18-47cc-89d0-15172826bfcc': {
                    nodeIdx: 0,
                    nodeUUID: '4fac7935-d13b-4b36-bf15-98075dca822a',
                    exitIdx: 0,
                    exitUUID: '445fc64c-2a18-47cc-89d0-15172826bfcc'
                }
            };
            // const action = updateComponents(components);
            // expect(reduce(action)).toEqual(components);
        });
    });
});
