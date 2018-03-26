import axiosMock from 'axios';
import * as React from 'react';
import { FlowEditorConfig } from '../flowTypes';
import { createSetup, Resp, restoreSpies, flushPromises } from '../testUtils';
import { resultsToSearchOpts } from '../utils';
import { GROUP_NOT_FOUND, GROUP_PLACEHOLDER } from './form/constants';
import SelectSearch, { SelectSearchProps } from './SelectSearch';

const { endpoints } = require('../../assets/config') as FlowEditorConfig;
const groupsResp = require('../../assets/groups.json') as Resp;

const baseProps = {
    url: endpoints.groups,
    name: 'Groups',
    resultType: 'groups',
    placeholder: GROUP_PLACEHOLDER,
    searchPromptText: GROUP_NOT_FOUND
};

const setup = createSetup<SelectSearchProps>(baseProps, null, SelectSearch);

const mapRespToSearchOpts = (resp: Resp) => resp.results.map(resultsToSearchOpts);

const COMPONENT_TO_TEST = SelectSearch.name;

describe(`${COMPONENT_TO_TEST}`, () => {
    describe('render', () => {
        it('should render self, children with required props', async () => {
            const selectRefSpy = jest.spyOn(SelectSearch.prototype, 'selectRef');
            const loadOptionsSpy = jest.spyOn(SelectSearch.prototype, 'loadOptions');
            const searchSpy = jest.spyOn(SelectSearch.prototype, 'search');
            const { wrapper, props: { name, placeholder, searchPromptText, url } } = setup();
            const SelectSearchInstance = wrapper.instance();
            const asyncSelect = wrapper.find('Async');

            // Yielding here because SelectSearch.search is called when axios.get in SelectSearch.loadOptions resolves
            await flushPromises();

            expect(selectRefSpy).toHaveBeenCalledTimes(1);
            expect(asyncSelect.props()).toEqual({
                className: undefined,
                name,
                placeholder,
                loadOptions: SelectSearchInstance.loadOptions,
                loadingPlaceholder: 'Loading...',
                cache: expect.any(Object),
                closeOnSelect: undefined,
                ignoreCase: false,
                ignoreAccents: false,
                value: undefined,
                openOnFocus: true,
                autoload: true,
                children: expect.any(Function),
                valueKey: 'id',
                labelKey: 'name',
                multi: undefined,
                clearable: undefined,
                searchable: true,
                onCloseResetsInput: true,
                onBlurResetsInput: true,
                filterOption: SelectSearchInstance.filterOption,
                onChange: SelectSearchInstance.onChange,
                searchPromptText,
                options: []
            });

            expect(loadOptionsSpy).toHaveBeenCalledTimes(1);
            expect(loadOptionsSpy).toHaveBeenCalledWith('', expect.any(Function));
            expect(searchSpy).toHaveBeenCalledTimes(1);
            expect(searchSpy).toHaveBeenCalledWith('', mapRespToSearchOpts(groupsResp));
            expect(axiosMock.get).toHaveBeenCalledTimes(1);
            expect(axiosMock.get).toHaveBeenCalledWith(url);

            restoreSpies(selectRefSpy, loadOptionsSpy, searchSpy);
        });
    });

    describe('instance methods', () => {
        describe('componentWillReceiveProps', () => {
            it(`should be called when ${COMPONENT_TO_TEST} receives new props`, () => {
                const componentWillReceivePropsSpy = jest.spyOn(
                    SelectSearch.prototype,
                    'componentWillReceiveProps'
                );
                const { wrapper } = setup();
                const nextProps = { ...baseProps, multi: true };

                wrapper.setProps(nextProps);

                expect(componentWillReceivePropsSpy).toHaveBeenCalledTimes(1);
                expect(componentWillReceivePropsSpy).toHaveBeenCalledWith(nextProps, {});

                componentWillReceivePropsSpy.mockRestore();
            });

            it(`should call ${COMPONENT_TO_TEST}.prototype.setState if ${COMPONENT_TO_TEST} receives a new initial option through props`, () => {
                const setStateSpy = jest.spyOn(SelectSearch.prototype, 'setState');
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
