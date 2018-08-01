import SendBroadcastForm from '~/components/flow/actions/sendbroadcast/SendBroadcastForm';
import { ActionFormProps } from '~/components/flow/props';
import { AssetType } from '~/services/AssetService';
import { LocalizedObject } from '~/services/Localization';
import { composeComponentTestUtils, getSpecWrapper } from '~/testUtils';
import { createBroadcastMsgAction, Spanish } from '~/testUtils/assetCreators';

const { assets: groups } = require('~/test/assets/groups.json');

const broadcastMsgAction = createBroadcastMsgAction();

const baseProps: ActionFormProps = {
    updateAction: jest.fn(),
    onClose: jest.fn(),
    onTypeChange: jest.fn(),
    nodeSettings: {
        originalNode: null,
        originalAction: broadcastMsgAction
    }
};

const { setup } = composeComponentTestUtils<ActionFormProps>(SendBroadcastForm, baseProps);

describe(SendBroadcastForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup(true);
            expect(getSpecWrapper(wrapper, 'recipients').html()).toContain('Rowan Seymour');
            expect(wrapper).toMatchSnapshot();
        });

        it('should render an empty form with no action', () => {
            const { wrapper, instance } = setup(true, {
                $merge: {
                    nodeSettings: { originalNode: null }
                }
            });

            expect(instance.state).toMatchSnapshot();
            expect(wrapper).toMatchSnapshot();
        });

        it('should render the localized text', () => {
            const localized = new LocalizedObject(broadcastMsgAction, {
                id: 'spa',
                name: 'Spanish',
                type: AssetType.Language
            });
            localized.addTranslation('text', 'espanols!');

            const { wrapper } = setup(true, {
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

    describe('event', () => {
        it('handles recipent change', () => {
            const { instance } = setup(true, {
                $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
            });
            instance.handleRecipientsChanged([{ id: 'group-0', name: 'My Group' }]);
            expect(instance.state).toMatchSnapshot();
        });

        it('handles text change', () => {
            const { instance, props } = setup(true, {
                $merge: { updateSendBroadcastForm: jest.fn().mockReturnValue(true) }
            });
            instance.handleMessageUpdate('Message to Group');
            expect(instance.state).toMatchSnapshot();
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
            expect(instance.state).toMatchSnapshot();
        });
    });
});
