import { getTypeConfig } from '~/config';
import { Types } from '~/config/typeConfigs';
import { AssetType } from '~/services/AssetService';
import { LocalizedObject } from '~/services/Localization';
import { composeComponentTestUtils, getSpecWrapper } from '~/testUtils';
import { createBroadcastMsgAction, Spanish } from '~/testUtils/assetCreators';

import { SendBroadcastForm, SendBroadcastFormProps } from './SendBroadcastForm';
import { SendBroadcastFormHelper } from './SendBroadcastFormHelper';

const { assets: groups } = require('~/test/assets/groups.json');

const broadcastMsgAction = createBroadcastMsgAction();
const sendConfig = getTypeConfig(Types.send_broadcast);

const formHelper = new SendBroadcastFormHelper();

const baseProps: SendBroadcastFormProps = {
    action: broadcastMsgAction,
    formHelper,
    updateAction: jest.fn(),
    typeConfig: sendConfig,
    language: null,
    translating: false,
    updateLocalizations: jest.fn(),
    updateSendBroadcastForm: jest.fn(),
    form: formHelper.initializeForm({
        originalNode: null,
        originalAction: broadcastMsgAction
    })
};

const { setup, spyOn } = composeComponentTestUtils<SendBroadcastFormProps>(
    SendBroadcastForm,
    baseProps
);

describe(SendBroadcastForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup(true);
            expect(getSpecWrapper(wrapper, 'recipients').html()).toContain('Rowan Seymour');
            expect(wrapper).toMatchSnapshot();
        });

        it('should render an empty form with no action', () => {
            const { wrapper, props } = setup(true, {
                $merge: {
                    form: formHelper.initializeForm({ originalNode: null })
                }
            });

            expect(props.form).toEqual({
                recipients: { value: [] },
                text: { value: '' },
                type: Types.send_broadcast,
                valid: false
            });

            expect(wrapper).toMatchSnapshot();
        });

        it('should render the localized text', () => {
            const localized = new LocalizedObject(broadcastMsgAction, {
                id: 'spa',
                name: 'Spanish',
                type: AssetType.Language
            });
            localized.addTranslation('text', 'espanols!');

            const { wrapper, props } = setup(true, {
                $merge: {
                    translating: true,
                    language: { name: 'Spanish', iso: 'spa' },
                    settings: {
                        originalAction: broadcastMsgAction,
                        localizations: [localized]
                    }
                }
            });

            expect(getSpecWrapper(wrapper, 'text-to-translate').text()).toEqual('Hello World');
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('onValid', () => {
        it('processes the form for normal edits', () => {
            const { wrapper, instance, props } = setup(true, {
                $merge: { updateAction: jest.fn() }
            });
            instance.onValid();
            expect(props.updateAction).toBeCalledWith(broadcastMsgAction);
        });

        it('clears translations', () => {
            const { instance, props } = setup(true, {
                $merge: {
                    translating: true,
                    language: Spanish,
                    form: {
                        ...formHelper.initializeForm({
                            originalNode: null,
                            originalAction: broadcastMsgAction,
                            localizations: [new LocalizedObject(broadcastMsgAction, Spanish)]
                        })
                    },
                    updateLocalizations: jest.fn()
                }
            });

            instance.onValid();
            expect(props.updateLocalizations).toBeCalledWith('spa', [
                { translations: null, uuid: 'send_broadcast-0' }
            ]);
        });

        it('updates translations', () => {
            const { instance, props } = setup(true, {
                $merge: {
                    translating: true,
                    language: Spanish,
                    localizations: [new LocalizedObject(broadcastMsgAction, Spanish)],
                    updateLocalizations: jest.fn()
                }
            });

            instance.onValid();
            expect(props.updateLocalizations).toBeCalledWith('spa', [
                { translations: { text: ['Hello World'] }, uuid: 'send_broadcast-0' }
            ]);
        });
    });

    describe('event', () => {
        it('handles recipent change', () => {
            const { instance, props } = setup(true, {
                $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
            });
            instance.handleRecipientsChanged([{ id: 'group-0', name: 'My Group' }]);
            expect(props.updateSendBroadcastForm).toBeCalledWith({
                recipients: { value: [{ id: 'group-0', name: 'My Group' }] }
            });
        });

        it('handles text change', () => {
            const { instance, props } = setup(true, {
                $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
            });
            instance.handleMessageUpdate('Message to Group');

            expect(props.updateSendBroadcastForm).toBeCalledWith({
                text: { value: 'Message to Group' }
            });
        });

        it('handles translation change', () => {
            const { instance, props } = setup(true, {
                $merge: {
                    translating: true,
                    language: { name: 'Spanish', iso: 'spa' },
                    localizations: [new LocalizedObject(broadcastMsgAction, Spanish)],
                    updateSendBroadcastForm: jest.fn().mockReturnValue(true)
                }
            });

            instance.handleMessageUpdate('espanols!');
            expect(props.updateSendBroadcastForm).toBeCalledWith({ text: { value: 'espanols!' } });
        });
    });
});
