import { Types } from '../../../config/typeConfigs';
import { removeAsset } from '../../../services/AssetService';
import {
    createSetContactFieldAction,
    createSetContactLanguageAction,
    createSetContactNameAction,
} from '../../../testUtils/assetCreators';
import { getLanguage } from '../../../utils/languageMap';
import { languageToAsset } from './helpers';
import { SetContactAttribFormHelper } from './SetContactAttribFormHelper';

const formHelper = new SetContactAttribFormHelper();

const setContactFieldAction = createSetContactFieldAction();
const setContactNameAction = createSetContactNameAction();
const setContactLanguageAction = createSetContactLanguageAction();

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
        it('should provide initial form state from scratch: set_contact_field', () => {
            const formState = formHelper.actionToState(null, Types.set_contact_field);

            expect(formState.value).toEqual({ value: '' });
            expect(formState).toMatchSnapshot(Types.set_contact_field);
        });

        it('should provide initial form state from scratch: set_contact_name', () => {
            const formState = formHelper.actionToState(null, Types.set_contact_name);

            expect(formState.value).toEqual({ value: '' });
            expect(formState).toMatchSnapshot(Types.set_contact_name);
        });

        it('should provide initial form state from scratch: set_contact_language', () => {
            const formState = formHelper.actionToState(null, Types.set_contact_language);

            expect(formState.value).toEqual({ value: removeAsset });
            expect(formState).toMatchSnapshot(Types.set_contact_language);

            // action has language
            const formStateWithAction = formHelper.actionToState(
                setContactLanguageAction,
                Types.set_contact_name
            );
            expect(formStateWithAction.value).toEqual({
                value: languageToAsset(getLanguage(setContactLanguageAction.language))
            });
            expect(formStateWithAction).toMatchSnapshot(
                `${Types.set_contact_name} - action has language`
            );

            // action doesn't have language
            const formStateWithClearedAction = formHelper.actionToState(
                { ...setContactLanguageAction, language: '' },
                Types.set_contact_name
            );
            expect(formStateWithClearedAction.value).toEqual({
                value: removeAsset
            });
            expect(formStateWithClearedAction).toMatchSnapshot(
                `${Types.set_contact_name} - action doesn't have language`
            );
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
