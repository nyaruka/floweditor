import { getFlow, getFlows } from '.';
import { FlowEditorConfig } from '../flowTypes';
import { Resp } from '../testUtils';
import { configProviderContext } from '../testUtils/index';

const { results: flowResults } = require('../../__test__/assets/flows.json') as Resp;

const { endpoints: { flows: flowsEndpoint } } = configProviderContext;

describe('external', () => {
    describe('getFlow', () => {
        it('should get a flow', async () => {
            expect(await getFlow('/assets/flows.json', 'boring', false)).toBeDefined();
        });
    });

    describe('getFlows', () => {
        it('should fetch a list of flows', async () => {
            expect(await getFlows('/assets/flows.json')).toEqual(flowResults);
        });
    });
});
