import * as React from 'react';
import * as nock from 'nock';
import { shallow } from 'enzyme';
import FlowEditor from './index';
import Flow from './Flow';
import ComponentMap from '../services/ComponentMap';
import FlowMutator from '../services/FlowMutator';
import { getSpecWrapper } from '../utils';
import { getBaseLanguage } from './index';
import { DEV_SERVER_PORT } from '../../webpack/webpack.dev';

const config = require('../../assets/config.js');
const {
    results: [{ definition }]
} = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { results: getFlowsResp } = require('../../assets/flows.json');

const { languages, endpoints, flow: flowUUID } = config;
const baseLanguage = getBaseLanguage(languages);

const languageSelectorExpectedProps = {
    languages,
    iso: baseLanguage.iso
};

// Mock external methods -----------------------------------------
jest.unmock('../external');

const external = require('../external');

const getFlowMock = jest.fn(() => Promise.resolve({ definition }));
const getFlowsMock = jest.fn(() => Promise.resolve(getFlowsResp));

external.getFlow = getFlowMock;
external.getFlows = getFlowsMock;
// ---------------------------------------------------------------

xdescribe('FlowEditor >', () => {
    describe('render >', () => {
        it('should render itself, children', () => {
            const wrapper = shallow(<FlowEditor config={config} />);

            expect(getSpecWrapper(wrapper, 'editor-container').exists()).toBeTruthy();
            expect(getSpecWrapper(wrapper, 'editor').hasClass('editor')).toBeTruthy();
            expect(wrapper.find('FlowList').props()).toEqual({
                onSelectFlow: wrapper.instance().onSelectFlow,
                flowOption: null,
                flowOptions: []
            });
            expect(wrapper.find('LanguageSelectorComp').props()).toEqual(
                expect.objectContaining(languageSelectorExpectedProps)
            );
            expect(wrapper.state('language')).toEqual(baseLanguage);
        });

        it('renders a Flow component', () => {
            const wrapper = shallow(<FlowEditor config={config} />);

            wrapper.setState({
                fetching: false,
                definition
            });

            expect(wrapper.find('Flow').exists()).toBeTruthy();
        });

        it('should apply translating style when the user selects a language other than base', () => {
            const language = { iso: 'spa', name: 'Spanish' };
            const wrapper = shallow(<FlowEditor config={config} />);

            wrapper.setState({
                language,
                translating:
                    baseLanguage.iso !== language.iso && baseLanguage.name !== language.name
            });

            expect(wrapper.state('language')).toEqual(language);
            expect(wrapper.state('translating')).toBeTruthy();
            expect(
                getSpecWrapper(wrapper, 'editor-container').hasClass('translating')
            ).toBeTruthy();
            expect(wrapper.find('LanguageSelectorComp').props()).toEqual(
                expect.objectContaining({
                    ...languageSelectorExpectedProps,
                    iso: language.iso
                })
            );
        });
    });

    describe('instance methods >', () => {
        describe('componentDidMount', () => {
            it('should be called, call "fetchFlow", "fetchFlowList" methods', () => {
                const componentDidMountSpy = jest.spyOn(FlowEditor.prototype, 'componentDidMount');
                const fetchFlowSpy = jest.spyOn(FlowEditor.prototype, 'fetchFlow');
                const fetchFlowListSpy = jest.spyOn(FlowEditor.prototype, 'fetchFlowList');

                const wrapper = shallow(<FlowEditor config={config} />);

                expect(componentDidMountSpy).toHaveBeenCalled();
                expect(fetchFlowSpy).toHaveBeenCalledWith(flowUUID);
                expect(fetchFlowListSpy).toHaveBeenCalled();

                componentDidMountSpy.mockRestore();
                fetchFlowSpy.mockRestore();
                fetchFlowListSpy.mockRestore();
            });
        });

        describe('fetchFlow', () => {
            it('should call "getFlow" helper', () => {
                const wrapper = shallow(<FlowEditor config={config} />);

                wrapper.instance().fetchFlow(flowUUID);

                expect(getFlowMock).toHaveBeenCalledWith(endpoints.flows, flowUUID, false);
            });
        });

        describe('fetchFlowList', () => {
            it('should call "getFlows" helper', () => {
                const wrapper = shallow(<FlowEditor config={config} />);

                wrapper.instance().fetchFlowList();

                expect(getFlowsMock).toHaveBeenCalledWith(endpoints.flows);
            });
        });

        describe('initialize', () => {
            it('should call "setDefinition" instance method', () => {
                const setDefinitionSpy = jest.spyOn(FlowEditor.prototype, 'setDefinition');

                const wrapper = shallow(<FlowEditor config={config} />);

                wrapper.instance().initialize(definition);

                expect(setDefinitionSpy).toHaveBeenCalledWith(definition);

                setDefinitionSpy.mockRestore();
            });
        });

        describe('setDefinition', () => {
            it('should update state w/ definition', () => {
                const setStateSpy = jest.spyOn(FlowEditor.prototype, 'setState');

                const wrapper = shallow(<FlowEditor config={config} />);

                wrapper.instance().setDefinition(definition);

                expect(setStateSpy).toHaveBeenCalledWith({
                    fetching: false,
                    definition
                });

                setStateSpy.mockRestore();
            });
        });
    });
});
