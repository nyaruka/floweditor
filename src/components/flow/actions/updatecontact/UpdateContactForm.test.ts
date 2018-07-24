import UpdateContactForm, {
    CHANNEL_PROPERTY,
    LANGUAGE_PROPERTY,
    NAME_PROPERTY,
    UpdateContactFormProps
} from '~/components/flow/actions/updatecontact/UpdateContactForm';
import { UpdateContactFormHelper } from '~/components/flow/actions/updatecontact/UpdateContactFormHelper';
import { getTypeConfig, Types } from '~/config/typeConfigs';
import { AssetType } from '~/services/AssetService';
import { composeComponentTestUtils } from '~/testUtils';
import { createSetContactFieldAction } from '~/testUtils/assetCreators';

const startSessionAction = createSetContactFieldAction();
const typeConfig = getTypeConfig(Types.set_contact_field);
const formHelper = new UpdateContactFormHelper();

const baseProps: UpdateContactFormProps = {
    formHelper,
    typeConfig,
    updateAction: jest.fn(),
    onTypeChange: jest.fn(),
    onClose: jest.fn(),
    nodeSettings: { originalNode: null, originalAction: startSessionAction }
};

const { setup, spyOn } = composeComponentTestUtils<UpdateContactFormProps>(
    UpdateContactForm,
    baseProps
);

describe(UpdateContactForm.name, () => {
    describe('render', () => {
        it('should render self, children with base props', () => {
            const { wrapper } = setup(true);
            expect(wrapper).toMatchSnapshot();
        });

        it('should render an empty form with no action', () => {
            const { wrapper, instance } = setup(true, {
                $merge: {
                    nodeSettings: { originalNode: null, originalAction: null }
                }
            });

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('updates', () => {
        let form: any;

        beforeEach(() => {
            form = setup(true);
        });

        it('should update name', () => {
            form.instance.handlePropertyChange([NAME_PROPERTY]);
            form.instance.handleNameUpdate('Rowan Seymour');
            form.instance.handleSave();
            expect(form.instance.state).toMatchSnapshot();
            expect(form.props.updateAction).toHaveBeenCalled();
        });

        it('should update field value', () => {
            form.instance.handlePropertyChange([
                { id: 'birthday', name: 'Birthday', type: AssetType.Field }
            ]);
            form.instance.handleFieldValueUpdate('12/25/00');
            form.instance.handleSave();
            expect(form.instance.state).toMatchSnapshot();
            expect(form.props.updateAction).toHaveBeenCalled();
        });

        it('should update language', () => {
            form.instance.handlePropertyChange([LANGUAGE_PROPERTY]);
            form.instance.handleLanguageUpdate('eng');
            form.instance.handleSave();
            expect(form.instance.state).toMatchSnapshot();
            expect(form.props.updateAction).toHaveBeenCalled();
        });

        it('should update channel', () => {
            form.instance.handlePropertyChange([CHANNEL_PROPERTY]);
            form.instance.handleChannelUpdate([
                { id: 'channel_id', name: 'Channel Name', type: AssetType.Channel }
            ]);
            form.instance.handleSave();
            expect(form.instance.state).toMatchSnapshot();
            expect(form.props.updateAction).toHaveBeenCalled();
        });

        it('should validate before saving', () => {
            form.instance.handlePropertyChange([CHANNEL_PROPERTY]);
            form.instance.handleChannelUpdate([null]);

            form.props.updateAction.mockClear();
            form.props.onClose.mockClear();
            form.instance.handleSave();
            expect(form.instance.state).toMatchSnapshot();
            expect(form.props.updateAction).not.toBeCalled();
            expect(form.props.onClose).not.toBeCalled();
        });
    });
});
