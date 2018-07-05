import { getTypeConfig } from '~/config';
import { Types } from '~/config/typeConfigs';

import Constants from './constants';
import reducer, {
    initialState,
    operand as operandReducer,
    resultName as resultNameReducer,
    showResultName as showResultNameReducer,
    timeout as timeoutReducer,
    typeConfig as typeConfigReducer,
    updateOperand,
    updateResultName,
    updateShowResultName,
    updateTimeout,
    updateTypeConfig,
    updateUserAddingAction,
    userAddingAction as userAddingActionReducer
} from './nodeEditor';

const definition = require('~/test/flows/boring.json');

describe('nodeEditor action creators', () => {
    describe('updateTypeConfig', () => {
        it('should create an action to update typeConfig state', () => {
            const typeConfig = getTypeConfig(Types.send_msg);
            const expectedAction = {
                type: Constants.UPDATE_TYPE_CONFIG,
                payload: {
                    typeConfig
                }
            };
            expect(updateTypeConfig(typeConfig)).toEqual(expectedAction);
        });
    });

    describe('updateResultName', () => {
        it('should create an action to update resultName state', () => {
            const resultName = 'color';
            const expectedAction = {
                type: Constants.UPDATE_RESULT_NAME,
                payload: {
                    resultName
                }
            };
            expect(updateResultName(resultName)).toEqual(expectedAction);
        });
    });

    describe('updateOperand', () => {
        it('should create an action to update operand state', () => {
            const operand = '@contact.name';
            const expectedAction = {
                type: Constants.UPDATE_OPERAND,
                payload: {
                    operand
                }
            };
            expect(updateOperand(operand)).toEqual(expectedAction);
        });
    });

    describe('updateUserAddingAction', () => {
        it('should create an action to update userAddingAction state', () => {
            const userAddingAction = false;
            const expectedAction = {
                type: Constants.UPDATE_USER_ADDING_ACTION,
                payload: {
                    userAddingAction
                }
            };
            expect(updateUserAddingAction(userAddingAction)).toEqual(expectedAction);
        });
    });

    describe('updateShowResultName', () => {
        it('should create an action to update showResultName state', () => {
            const showResultName = true;
            const expectedAction = {
                type: Constants.UPDATE_SHOW_RESULT_NAME,
                payload: {
                    showResultName
                }
            };
            expect(updateShowResultName(showResultName)).toEqual(expectedAction);
        });
    });

    describe('updateTimeout', () => {
        it('should create an action to update timeout state', () => {
            const timeout = 60;
            const expectedAction = {
                type: Constants.UPDATE_TIMEOUT,
                payload: {
                    timeout
                }
            };
            expect(updateTimeout(timeout)).toEqual(expectedAction);
        });
    });
});

describe('nodeEditor reducers', () => {
    describe('typeConfig reducer', () => {
        const reduce = (action: any) => typeConfigReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.typeConfig);
        });

        it('should handle UPDATE_TYPE_CONFIG', () => {
            const typeConfig = getTypeConfig(Types.send_msg);
            const action = updateTypeConfig(typeConfig);
            expect(reduce(action)).toEqual(typeConfig);
        });
    });

    describe('resultName reducer', () => {
        const reduce = (action: any) => resultNameReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.resultName);
        });

        it('should handle UPDATE_RESULT_NAME', () => {
            const resultName = 'age';
            const action = updateResultName(resultName);
            expect(reduce(action)).toEqual(resultName);
        });
    });

    describe('showResultName reducer', () => {
        const reduce = (action: any) => showResultNameReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.showResultName);
        });

        it('should handle UPDATE_SHOW_RESULT_NAME', () => {
            const showResultName = true;
            const action = updateShowResultName(showResultName);
            expect(reduce(action)).toEqual(showResultName);
        });
    });

    describe('operand reducer', () => {
        const reduce = (action: any) => operandReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.operand);
        });

        it('should handle UPDATE_OPERAND', () => {
            const operand = '@run.results.color';
            const action = updateOperand(operand);
            expect(reduce(action)).toEqual(operand);
        });
    });

    describe('userAddingAction reducer', () => {
        const reduce = (action: any) => userAddingActionReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.userAddingAction);
        });

        it('should handle UPDATE_USER_ADDING_ACTION', () => {
            const userAddingAction = true;
            const action = updateUserAddingAction(userAddingAction);
            expect(reduce(action)).toEqual(userAddingAction);
        });
    });

    describe('timeout reducer', () => {
        const reduce = (action: any) => timeoutReducer(undefined, action);

        it('should return initial state', () => {
            expect(reduce({})).toEqual(initialState.timeout);
        });

        it('should handle UPDATE_ACTION_TO_EDIT', () => {
            const timeout = 60;
            const action = updateTimeout(timeout);
            expect(reduce(action)).toEqual(timeout);
        });
    });
});
