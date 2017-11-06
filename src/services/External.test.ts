import nock from 'nock';
import External, { ACTIVITY_ENDPOINT, FLOWS_ENDPOINT } from './External';

const {
    results: [{ uuid: flowUUID, name: flowName, definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const external = new External();

const getFlowsResponse = {
    uuid: flowUUID,
    name: flowName,
    definition,
    dependencies: []
};

const getFlowNock = nock('http://localhost:9000')
    .get(FLOWS_ENDPOINT)
    .query({ uuid: flowUUID })
    .reply(200, getFlowsResponse);

afterAll(() => nock.cleanAll())

describe('Helpers: external', () => {
    it('should get a flow', () => {
        external
            .getFlow(flowUUID, false, FLOWS_ENDPOINT)
            .then(response => expect(response).toEqual(getFlowsResponse));
    });
});
