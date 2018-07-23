import Constants from '~/store/constants';
import { updateSendBroadcastForm, updateStartSessionForm } from '~/store/forms';
import { createMockStore, prepMockDuxState } from '~/testUtils';
import { createSetContactFieldAction, createSetContactNameAction } from '~/testUtils/assetCreators';

const [flowAsset] = require('~/test/assets/flows.json');

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
});
