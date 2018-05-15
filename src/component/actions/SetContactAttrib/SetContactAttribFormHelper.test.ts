import { Types } from '../../../config/typeConfigs';
import {
    createSetContactFieldAction,
    createSetContactNameAction
} from '../../../testUtils/assetCreators';
import { SetContactAttribFormHelper } from './SetContactAttribFormHelper';

const formHelper = new SetContactAttribFormHelper();

const setContactFieldAction = createSetContactFieldAction();

const setContactNameAction = createSetContactNameAction();

const setContactFieldFormState = formHelper.actionToState(
    setContactFieldAction,
    Types.set_contact_field
);

const setContactNameFormState = formHelper.actionToState(
    setContactNameAction,
    Types.set_contact_name
);

describe('SetContactAttribFormHelper', () => {
    describe('actionToState', () => {
        it('should provide initial form state from scratch', () => {
            const newContactFieldFormState = formHelper.actionToState(
                null,
                Types.set_contact_field
            );

            expect(newContactFieldFormState.value).toEqual({ value: '' });
            expect(newContactFieldFormState).toMatchSnapshot(Types.set_contact_field);

            const newContactNameFormState = formHelper.actionToState(null, Types.set_contact_name);

            expect(newContactNameFormState.value).toEqual({ value: '' });
            expect(newContactNameFormState).toMatchSnapshot(Types.set_contact_name);
        });
    });

    describe('stateToAction', () => {
        it('should convert form state to an action', () => {
            expect(
                formHelper.stateToAction(
                    setContactFieldAction.uuid,
                    setContactFieldFormState,
                    Types.set_contact_field
                )
            ).toEqual(setContactFieldAction);

            expect(
                formHelper.stateToAction(
                    setContactNameAction.uuid,
                    setContactNameFormState,
                    Types.set_contact_name
                )
            ).toEqual(setContactNameAction);
        });
    });
});
