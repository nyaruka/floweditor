import { AssetType } from '../../services/AssetService';
import { composeComponentTestUtils, Resp } from '../../testUtils';
import { merge } from '../../utils';
import SelectOption, { SelectOptionProps } from './SelectOption';

const groupsResp = require('../../../__test__/assets/groups.json') as Resp;

const baseProps: SelectOptionProps = {
    className: 'myOption',
    isFocused: false,
    option: { name: 'Option', id: 'option-id', type: AssetType.Contact },
    onFocus: jest.fn(),
    onSelect: jest.fn()
};

const { setup, spyOn } = composeComponentTestUtils(SelectOption, baseProps);

describe(SelectOption.name, () => {
    describe('render', () => {
        it('should render user option', () => {
            const { wrapper } = setup(false, {
                $merge: {
                    option: {
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
                    option: {
                        name: 'My Group',
                        id: 'group-id',
                        type: AssetType.Group
                    }
                }
            });

            expect(wrapper.html()).toMatchSnapshot('group');
        });

        it('should render group option with icon', () => {
            const { wrapper } = setup(
                false,
                merge({
                    option: {
                        name: 'My URN',
                        id: 'tel:123456',
                        type: AssetType.URN
                    }
                })
            );

            expect(wrapper.html()).toMatchSnapshot('urn');
        });
    });

    describe('events', () => {
        it('handles mouse down', () => {
            const { wrapper, instance, props } = setup(false);
            wrapper.simulate('mouseDown', {});
            expect(props.onSelect).toHaveBeenCalled();
        });

        it('handles mouse move', () => {
            const { wrapper, instance, props } = setup(false);
            wrapper.simulate('mouseMove', {});
            expect(props.onFocus).toHaveBeenCalled();
        });

        it('handles mouse move focused', () => {
            const { wrapper, instance, props } = setup(false, { $merge: { isFocused: true } });
            wrapper.simulate('mouseMove', {});
            expect(props.onFocus).toHaveBeenCalled();
        });

        it('handles mouse enter', () => {
            const { wrapper, instance, props } = setup(false);
            wrapper.simulate('mouseEnter', {});
            expect(props.onFocus).toHaveBeenCalled();
        });
    });
});
