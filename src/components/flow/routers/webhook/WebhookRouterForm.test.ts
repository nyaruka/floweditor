import { RouterFormProps } from '~/components/flow/props';
import WebhookRouterForm from '~/components/flow/routers/webhook/WebhookRouterForm';
import { Types } from '~/config/typeConfigs';
import { RenderNode } from '~/store/flowContext';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createWebhookRouterNode, getRouterFormProps } from '~/testUtils/assetCreators';

import * as utils from '~/utils';
mock(utils, 'createUUID', utils.seededUUIDs());

const { setup } = composeComponentTestUtils<RouterFormProps>(
    WebhookRouterForm,
    getRouterFormProps({
        node: createWebhookRouterNode(),
        ui: { type: Types.call_webhook }
    } as RenderNode)
);

describe(WebhookRouterForm.name, () => {
    it('should render', () => {
        const { wrapper } = setup(true);
        expect(wrapper).toMatchSnapshot();
    });

    describe('updates', () => {
        it('should save changes', () => {
            const { instance, props } = setup(true, {
                $merge: { onClose: jest.fn(), updateRouter: jest.fn() }
            });

            instance.handleMethodUpdate('POST');
            instance.handlePostBodyUpdate('Post Body');
            instance.handleUrlUpdate('http://domain.com/');
            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateRouter).toHaveBeenCalled();
            expect((props.updateRouter as any).mock.calls[0][0]).toMatchSnapshot();
        });

        it('should cancel', () => {
            const { instance, props } = setup(true, {
                $merge: { onClose: jest.fn(), updateRouter: jest.fn() }
            });
            instance.getButtons().secondary.onClick();
            instance.handleUrlUpdate('http://domain.com/');
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateRouter).not.toHaveBeenCalled();
        });
    });
});
