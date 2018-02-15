import * as nock from 'nock';
import { DEV_SERVER_PORT } from '../../../webpack.dev';
import { ACTIVITY_ENDPOINT, FLOWS_ENDPOINT, getFlow, getFlows } from './external';

const {
    results: [{ uuid: flowUUID, name: flowName, definition }]
} = require('../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { results: getFlowsResp } = require('../../../assets/flows.json');

const getFlowResp = {
    uuid: flowUUID,
    name: flowName,
    definition,
    dependencies: []
};

const getFlowNock = nock(`http://localhost:${DEV_SERVER_PORT}`)
    .get(FLOWS_ENDPOINT)
    .query({ uuid: flowUUID })
    .reply(200, getFlowResp);

const getFlowsNock = nock(`http://localhost:${DEV_SERVER_PORT}`)
    .get(FLOWS_ENDPOINT)
    .reply(200, getFlowsResp);

afterAll(() => nock.cleanAll());

describe('Providers: external', () => {
    describe('getFlow', () => {
        it('should get a flow', () => {
            getFlow(flowUUID, false).then(response => expect(response).toEqual(getFlowResp));
        });
    });

    describe('getFlows', () => {
        it('should fetch a list of flows', () => {
            getFlows().then(response => expect(response).toEqual(getFlowsResp));
        });
    });
});
