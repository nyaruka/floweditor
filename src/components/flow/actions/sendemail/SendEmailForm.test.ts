import SendEmailForm from '~/components/flow/actions/sendemail/SendEmailForm';
import { ActionFormProps } from '~/components/flow/props';
import { composeComponentTestUtils, mock } from '~/testUtils';
import { createSendEmailAction, getActionFormProps } from '~/testUtils/assetCreators';
import * as utils from '~/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const { setup } = composeComponentTestUtils<ActionFormProps>(
    SendEmailForm,
    getActionFormProps(createSendEmailAction())
);

describe(SendEmailForm.name, () => {
    describe('render', () => {
        it('should render', () => {
            const { wrapper } = setup(true);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('updates', () => {
        it('should save changes', () => {
            const { instance, props } = setup(true);

            instance.handleRecipientsChanged(['joe@domain.com', 'jane@domain.com']);
            instance.handleSubjectChanged('URGENT: I have a question');
            instance.handleBodyChanged('What is a group of tigers called?');

            expect(instance.state).toMatchSnapshot();

            instance.handleSave();
            expect(props.updateAction).toHaveBeenCalled();
            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });

        it('should validate emails', () => {
            const { instance } = setup(true);
            expect(instance.handleCheckValid('invalid')).toBeFalsy();
            expect(instance.handleCheckValid('invalid@')).toBeFalsy();
            expect(instance.handleCheckValid('valid@domain.com')).toBeTruthy();
        });

        it('should have an email prompt', () => {
            const { instance } = setup(true);
            expect(instance.handleValidPrompt('joe@domain.com')).toBe(
                'Send email to joe@domain.com'
            );
        });

        it('should allow switching from router', () => {
            const { instance, props } = setup(true, {
                $merge: { updateAction: jest.fn() },
                nodeSettings: { $merge: { originalAction: null } }
            });

            instance.handleRecipientsChanged(['joe@domain.com', 'jane@domain.com']);
            instance.handleSubjectChanged('URGENT: I have a question');
            instance.handleBodyChanged('What is a group of tigers called?');
            instance.handleSave();

            expect((props.updateAction as any).mock.calls[0]).toMatchSnapshot();
        });
    });

    describe('cancel', () => {
        it('should cancel without changes', () => {
            const { instance, props } = setup(true, {
                $merge: { onClose: jest.fn(), updateAction: jest.fn() }
            });

            instance.handleRecipientsChanged(['joe@domain.com']);
            instance.handleSubjectChanged('Bad mojo');
            instance.handleBodyChanged("Don't save me bro");

            instance.getButtons().secondary.onClick();
            expect(props.onClose).toHaveBeenCalled();
            expect(props.updateAction).not.toHaveBeenCalled();
        });
    });
});
