import { GROUP_NOT_FOUND, GROUP_PLACEHOLDER } from '~/components/form/constants';
import SelectSearch, { SelectSearchProps } from '~/components/form/select/SelectSearch';
import AssetService from '~/services/AssetService';
import { composeComponentTestUtils, flushPromises, restoreSpies } from '~/testUtils';

const config = require('~/test/config');

const baseProps: SelectSearchProps = {
    name: 'Groups',
    placeholder: GROUP_PLACEHOLDER,
    searchPromptText: GROUP_NOT_FOUND,
    assets: new AssetService(config).getGroupAssets()
};

const { setup, spyOn } = composeComponentTestUtils(SelectSearch, baseProps);

xdescribe(SelectSearch.name, () => {
    describe('render', () => {
        it('should render self, children with required props', async () => {
            const selectRefSpy = spyOn('selectRef');
            const loadOptionsSpy = spyOn('loadOptions');
            const searchSpy = spyOn('search');
            const {
                wrapper,
                instance,
                props: { name, placeholder, searchPromptText }
            } = setup(false);
            const asyncSelect = wrapper.find('Async');

            // Yielding here because SelectSearch.search is called when axios.get in SelectSearch.loadOptions resolves
            await flushPromises();

            wrapper.update();

            expect(selectRefSpy).toHaveBeenCalledTimes(1);
            expect(asyncSelect.props()).toMatchSnapshot();

            expect(loadOptionsSpy).toHaveBeenCalledTimes(1);
            expect(loadOptionsSpy).toHaveBeenCalledWith('', expect.any(Function));
            expect(searchSpy).toHaveBeenCalledTimes(1);
            expect(searchSpy).toHaveBeenCalledWith('');
            expect(wrapper).toMatchSnapshot();

            restoreSpies(selectRefSpy, loadOptionsSpy, searchSpy);
        });
    });

    describe('instance methods', () => {
        describe('componentWillReceiveProps', () => {
            it('should be called when it receives new props', () => {
                const componentWillReceivePropsSpy = spyOn('componentWillReceiveProps');
                const { wrapper } = setup();
                const nextProps = { ...baseProps, multi: true };

                wrapper.setProps(nextProps);

                expect(componentWillReceivePropsSpy).toHaveBeenCalledTimes(1);
                expect(componentWillReceivePropsSpy).toHaveBeenCalledWith(
                    expect.objectContaining(nextProps),
                    expect.any(Object)
                );

                componentWillReceivePropsSpy.mockRestore();
            });

            it('should change single selection', () => {
                const { wrapper, instance, props } = setup(false, {
                    $merge: { multi: false, onChange: jest.fn() }
                });

                instance.onChange({
                    name: 'Subscribers',
                    uuid: '33b28bac-b588-43e4-90de-fda77aeaf7c0'
                });

                expect(props.onChange).toHaveBeenCalledWith([
                    { name: 'Subscribers', uuid: '33b28bac-b588-43e4-90de-fda77aeaf7c0' }
                ]);
            });

            it('should add a new item', () => {
                const { wrapper, instance, props } = setup(false, {
                    $merge: { multi: false, onChange: jest.fn() }
                });

                instance.onChange({
                    name: 'My New Group Name',
                    uuid: '2a5e3a2d-326e-4aca-b91e-4aff20c9b4c5',
                    isNew: true
                });

                expect(props.onChange).toHaveBeenCalledWith([
                    {
                        isNew: true,
                        name: 'My New Group Name',
                        uuid: '2a5e3a2d-326e-4aca-b91e-4aff20c9b4c5'
                    }
                ]);
            });
        });
    });
});
