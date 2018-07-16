import { AssetType } from '~/services/AssetService';
import { composeComponentTestUtils, getSpecWrapper, Resp } from '~/testUtils';

import SelectValue, { SelectValueProps } from '~/components/form/select/SelectValue';

const groupsResp = require('~/test/assets/groups.json') as Resp;

const baseProps: SelectValueProps = {
    value: { id: 'group-id', name: 'My Group', type: AssetType.Group },
    onRemove: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(SelectValue, baseProps);

describe(SelectValue.name, () => {
    describe('render', () => {
        it('should render user option', () => {
            const { wrapper } = setup(false, {
                $merge: {
                    value: {
                        name: 'My Contact',
                        id: 'contact-id',
                        type: AssetType.Contact
                    }
                }
            });

            expect(wrapper.html()).toMatchSnapshot('contact');
        });

        it('should render group option with icon', () => {
            const { wrapper } = setup(false, {
                $merge: {
                    value: {
                        name: 'My Group',
                        id: 'group-id',
                        type: AssetType.Group
                    }
                }
            });

            expect(wrapper.html()).toMatchSnapshot('group');
        });

        it('should render group option with icon', () => {
            const { wrapper } = setup(false, {
                $merge: {
                    value: {
                        name: 'My URN',
                        id: 'tel:123456',
                        type: AssetType.URN
                    }
                }
            });

            expect(wrapper.html()).toMatchSnapshot('urn');
        });
    });

    describe('events', () => {
        it('handles on click', () => {
            const { wrapper, instance, props } = setup(false);
            const button = getSpecWrapper(wrapper, 'remove-button');
            button.simulate('mouseup', {});
            expect(props.onRemove).toHaveBeenCalled();
        });
    });
});
