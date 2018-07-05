import { Types } from '~/config/typeConfigs';
import { Channel, SetContactChannel } from '~/flowTypes';
import { AssetType, removeAsset } from '~/services/AssetService';
import {
    createSendMsgAction,
    createSetContactChannelAction,
    createSetContactFieldAction,
    createSetContactLanguageAction,
    createSetContactNameAction
} from '~/testUtils/assetCreators';

import {
    SetContactAttribFormHelper,
    SetContactAttribFormHelperActionTypes
} from './SetContactAttribFormHelper';

const formHelper = new SetContactAttribFormHelper();

const sendMsgAction = createSendMsgAction();
const setContactFieldAction = createSetContactFieldAction();
const setContactNameAction = createSetContactNameAction();
const setContactLanguageAction = createSetContactLanguageAction();
const setContactChannelAction = createSetContactChannelAction();

const setContactFieldFormState = formHelper.initializeForm(
    {
        originalNode: null,
        originalAction: setContactFieldAction
    },
    Types.set_contact_field
);

const setContactNameFormState = formHelper.initializeForm(
    {
        originalNode: null,
        originalAction: setContactNameAction
    },
    Types.set_contact_name
);

const setContactLanguageFormState = formHelper.initializeForm(
    {
        originalNode: null,
        originalAction: setContactLanguageAction
    },
    Types.set_contact_language
);

const setContactChannelFormState = formHelper.initializeForm(
    {
        originalNode: null,
        originalAction: setContactChannelAction
    },
    Types.set_contact_channel
);

describe('SetContactAttribFormHelper', () => {
    const init = (type: SetContactAttribFormHelperActionTypes) => {
        return formHelper.initializeForm({ originalNode: null }, type);
    };

    describe('actionToState', () => {
        it('should provide initial form state from scratch: set_contact_field', () => {
            const formState = init(Types.set_contact_field);

            expect(formState.value).toEqual({ value: '' });
            expect(formState).toMatchSnapshot(Types.set_contact_field);
        });

        it('should provide initial form state from scratch: set_contact_name', () => {
            const formState = init(Types.set_contact_name);

            expect(formState.value).toEqual({ value: '' });
            expect(formState).toMatchSnapshot(Types.set_contact_name);
        });

        it('should provide initial form state from scratch: set_contact_language', () => {
            const formState = init(Types.set_contact_language);

            expect(formState.value).toEqual({ value: removeAsset });
            expect(formState).toMatchSnapshot(Types.set_contact_language);

            // action has language
            const formStateWithAction = formHelper.initializeForm(
                {
                    originalNode: null,
                    originalAction: setContactLanguageAction
                },
                Types.set_contact_language
            );

            expect(formStateWithAction.value).toEqual({
                value: {
                    id: 'eng',
                    name: 'eng',
                    type: 'language'
                }
            });

            expect(formStateWithAction).toMatchSnapshot(
                `${Types.set_contact_language} - action has language`
            );

            // action doesn't have language
            const formStateWithClearedAction = formHelper.initializeForm(
                {
                    originalNode: null,
                    originalAction: { ...setContactLanguageAction, language: '' }
                },
                Types.set_contact_language
            );

            expect(formStateWithClearedAction.value).toEqual({
                value: removeAsset
            });
            expect(formStateWithClearedAction).toMatchSnapshot(
                `${Types.set_contact_language} - action doesn't have language`
            );
        });

        it('should provide initial form state from scratch: set_contact_channel', () => {
            const formState = init(Types.set_contact_channel);

            expect(formState.value).toEqual({ value: removeAsset });
            expect(formState).toMatchSnapshot(Types.set_contact_channel);

            // action has channel
            const formStateWithAction = formHelper.initializeForm(
                {
                    originalNode: null,
                    originalAction: setContactChannelAction
                },
                Types.set_contact_channel
            );

            expect(formStateWithAction.value).toEqual({
                value: {
                    id: setContactChannelAction.uuid,
                    name: setContactChannelAction.channel.name,
                    type: AssetType.Language
                }
            });
            expect(formStateWithAction).toMatchSnapshot(
                `${Types.set_contact_channel} - action has channel`
            );

            // action doesn't have channel
            const formStateWithClearedAction = formHelper.initializeForm(
                {
                    originalNode: null,
                    originalAction: {
                        ...setContactChannelAction,
                        channel: {} as Channel
                    } as SetContactChannel
                },
                Types.set_contact_channel
            );

            expect(formStateWithClearedAction.value).toEqual({
                value: removeAsset
            });
            expect(formStateWithClearedAction).toMatchSnapshot(
                `${Types.set_contact_channel} - action doesn't have channel`
            );
        });
    });

    describe('stateToAction', () => {
        describe(Types.set_contact_field, () => {
            it('should convert form state to an action', () => {
                expect(
                    formHelper.stateToAction(
                        setContactFieldAction.uuid,
                        setContactFieldFormState,
                        Types.set_contact_field
                    )
                ).toEqual(setContactFieldAction);
            });
        });

        describe(Types.set_contact_name, () => {
            it('should convert form state to an action', () => {
                expect(
                    formHelper.stateToAction(
                        setContactNameAction.uuid,
                        setContactNameFormState,
                        Types.set_contact_name
                    )
                ).toEqual(setContactNameAction);
            });
        });

        describe(Types.set_contact_language, () => {
            it('should convert form state to an action', () => {
                expect(
                    formHelper.stateToAction(
                        setContactLanguageAction.uuid,
                        setContactLanguageFormState,
                        Types.set_contact_language
                    )
                ).toEqual(setContactLanguageAction);
            });

            it('should convert form state with cleared language to an action', () => {
                const clearedAction = {
                    ...setContactLanguageAction,
                    language: ''
                };
                const formStateWithClearedAction = formHelper.initializeForm(
                    {
                        originalNode: null,
                        originalAction: clearedAction
                    },
                    Types.set_contact_language
                );

                expect(
                    formHelper.stateToAction(
                        setContactLanguageAction.uuid,
                        formStateWithClearedAction,
                        Types.set_contact_language
                    )
                ).toEqual(clearedAction);
            });
        });

        describe(Types.set_contact_channel, () => {
            it('should convert form state to an action', () => {
                expect(
                    formHelper.stateToAction(
                        setContactChannelAction.uuid,
                        setContactChannelFormState,
                        Types.set_contact_channel
                    )
                ).toEqual(setContactChannelAction);
            });

            it('should convert form state with cleared channel to an action', () => {
                const clearedAction = {
                    ...setContactChannelAction,
                    channel: {}
                };
                const formStateWithClearedAction = formHelper.initializeForm(
                    {
                        originalNode: null,
                        originalAction: clearedAction
                    },
                    Types.set_contact_channel
                );

                expect(
                    formHelper.stateToAction(
                        setContactChannelAction.uuid,
                        formStateWithClearedAction,
                        Types.set_contact_channel
                    )
                ).toEqual(clearedAction);
            });
        });
    });
});
