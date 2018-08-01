import SendEmailForm from '~/components/flow/actions/sendemail/SendEmailForm';
import { ActionFormProps } from '~/components/flow/props';
import { composeComponentTestUtils } from '~/testUtils';
import { createSendEmailAction } from '~/testUtils/assetCreators';

const action = createSendEmailAction();

const baseProps: ActionFormProps = {
    updateAction: jest.fn(),
    onClose: jest.fn(),
    onTypeChange: jest.fn(),
    nodeSettings: {
        originalNode: null,
        originalAction: action
    }
};

const { setup } = composeComponentTestUtils<ActionFormProps>(SendEmailForm, baseProps);

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
