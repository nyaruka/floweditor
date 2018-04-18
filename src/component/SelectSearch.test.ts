import axiosMock from 'axios';
import { FlowEditorConfig, ResultType } from '../flowTypes';
import {
    composeComponentTestUtils,
    configProviderContext,
    Resp,
    flushPromises,
    restoreSpies
} from '../testUtils';
import { resultsToSearchOpts } from '../utils';
import { GROUP_NOT_FOUND, GROUP_PLACEHOLDER } from './form/constants';
import SelectSearch, { SelectSearchProps } from './SelectSearch';

const groupsResp = require('../../assets/groups.json') as Resp;

const baseProps: SelectSearchProps = {
    url: configProviderContext.endpoints.groups,
    name: 'Groups',
    resultType: ResultType.group,
    placeholder: GROUP_PLACEHOLDER,
    searchPromptText: GROUP_NOT_FOUND
};

const { setup, spyOn } = composeComponentTestUtils(SelectSearch, baseProps);

describe(SelectSearch.name, () => {
    const mapRespToSearchOpts = (resp: Resp) => resp.results.map(resultsToSearchOpts);

    describe('render', () => {
        it('should render self, children with required props', async () => {
            const selectRefSpy = spyOn('selectRef');
            const loadOptionsSpy = spyOn('loadOptions');
            const searchSpy = spyOn('search');
            const {
                wrapper,
                instance,
                props: { name, placeholder, searchPromptText, url }
            } = setup(false);
            const asyncSelect = wrapper.find('Async');

            // Yielding here because SelectSearch.search is called when axios.get in SelectSearch.loadOptions resolves
            await flushPromises();

            wrapper.update();

            expect(selectRefSpy).toHaveBeenCalledTimes(1);
            expect(asyncSelect.props()).toEqual(
                expect.objectContaining({
                    className: undefined,
                    name,
                    placeholder,
                    loadOptions: instance.loadOptions,
                    filterOption: instance.filterOption,
                    onChange: instance.onChange,
                    searchPromptText,
                    options: []
                })
            );

            expect(loadOptionsSpy).toHaveBeenCalledTimes(1);
            expect(loadOptionsSpy).toHaveBeenCalledWith('', expect.any(Function));
            expect(searchSpy).toHaveBeenCalledTimes(1);
            expect(searchSpy).toHaveBeenCalledWith('', mapRespToSearchOpts(groupsResp));
            expect(axiosMock.get).toHaveBeenCalledTimes(1);
            expect(axiosMock.get).toHaveBeenCalledWith(url);
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
                    nextProps,
                    expect.any(Object)
                );

                componentWillReceivePropsSpy.mockRestore();
            });

            it('should set state if it receives a new initial option through props', () => {
                const setStateSpy = spyOn('setState');
                const { wrapper } = setup();
                const initial = mapRespToSearchOpts(groupsResp);
                const nextProps = { ...baseProps, initial };

                wrapper.setProps(nextProps);

                expect(setStateSpy).toHaveBeenCalledTimes(1);
                expect(setStateSpy).toHaveBeenCalledWith({
                    selections: initial
                });

                setStateSpy.mockRestore();
            });
        });
    });
});
