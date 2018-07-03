import { fieldToAsset, propertyToAsset } from '../component/actions/SetContactAttrib/helpers';
import { Types } from '../config/typeConfigs';
import { createMockStore, prepMockDuxState } from '../testUtils';
import {
    createSetContactFieldAction,
    createSetContactNameAction
} from '../testUtils/assetCreators';
import Constants from './constants';
import {
    updateSendBroadcastForm,
    updateSetContactAttribForm,
    updateStartSessionForm
} from './forms';

const [flowAsset] = require('../../__test__/assets/flows.json');

const setContactNameAction = createSetContactNameAction();
const setContactFieldAction = createSetContactFieldAction();

describe('form thunks', () => {
    let store: any;
    const { mockDuxState, testNodes } = prepMockDuxState();

    beforeEach(() => {
        // prep our store to show that we are editing
        store = createMockStore(mockDuxState);
    });

    describe('updateSendBroadcastForm', () => {
        it('should dispatch form update action', () => {
            const text = { value: 'Look, a distraction!' };
            const newFormState = store.dispatch(updateSendBroadcastForm({ text }));

            expect(newFormState.text).toBe(text);
            expect(newFormState).toMatchSnapshot();
            expect(store).toHaveReduxActions([Constants.UPDATE_FORM]);
            expect(store).toHavePayload(Constants.UPDATE_FORM, {
                form: newFormState
            });
        });
    });

    describe('updateStartSessionForm', () => {
        it('should dispatch form update action', () => {
            const newFormState = store.dispatch(updateStartSessionForm({ flow: flowAsset }));

            expect(newFormState.flow).toBe(flowAsset);
            expect(newFormState).toMatchSnapshot();
            expect(store).toHaveReduxActions([Constants.UPDATE_FORM]);
            expect(store).toHavePayload(Constants.UPDATE_FORM, {
                form: newFormState
            });
        });
    });

    describe('updateSetContactAttribForm', () => {
        it('should dispatch form update action with new contact name attribute', () => {
            const attribute = { value: propertyToAsset(Types.set_contact_name) };
            const newFormState = store.dispatch(updateSetContactAttribForm(attribute));

            expect(newFormState[attribute.value.type]).toEqual(attribute);
            expect(newFormState).toMatchSnapshot();
            expect(store).toHaveReduxActions([Constants.UPDATE_FORM]);
            expect(store).toHavePayload(Constants.UPDATE_FORM, {
                form: newFormState
            });
        });

        it('should dispatch form update action with new contact field attribute', () => {
            const attribute = { value: fieldToAsset(setContactFieldAction.field) };
            const newFormState = store.dispatch(updateSetContactAttribForm(attribute));

            expect(newFormState[attribute.value.type]).toEqual(attribute);
            expect(newFormState).toMatchSnapshot();
            expect(store).toHaveReduxActions([Constants.UPDATE_FORM]);
            expect(store).toHavePayload(Constants.UPDATE_FORM, {
                form: newFormState
            });
        });

        it('should dispatch form update action with new value', () => {
            const value = '26';
            const entry = {
                value
            };
            const newFormState = store.dispatch(updateSetContactAttribForm(null, entry));

            expect(newFormState.value).toEqual({ value });
            expect(newFormState).toMatchSnapshot();
            expect(store).toHaveReduxActions([Constants.UPDATE_FORM]);
            expect(store).toHavePayload(Constants.UPDATE_FORM, {
                form: newFormState
            });
        });
    });
});
