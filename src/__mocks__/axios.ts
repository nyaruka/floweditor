import { config } from 'test/config';

export const axios = require.requireActual('axios');

const boringFlowResp = require('test/assets/flows/boring.json');
const flowsResp = require('test/assets/flows.json');
const groupsResp = require('test/assets/groups.json');
const contactsResp = require('test/assets/contacts.json');
const fieldsResp = require('test/assets/fields.json');
const recipientsResp = require('test/assets/recipients.json');
const labelsResp = require('test/assets/labels.json');
const revisionsResp = require('test/assets/revisions.json');
const completionResp = require('test/assets/completion.json');

const getEndpoint = (urlStr: string) => {
  const queryIdx = urlStr.indexOf('?');
  const hasQuery = queryIdx > -1;
  return {
    endpoint: hasQuery ? urlStr.slice(0, queryIdx) : urlStr,
    containsQuery: hasQuery ? true : false
  };
};
const containsUUIDQuery = (urlStr: string) => urlStr.indexOf('uuid=') > -1;
const resolvePromise = (data: { [key: string]: any }) => Promise.resolve({ data });
const getUUIDQuery = (urlStr: string) => {
  for (const param of urlStr.split(/\&|\?/)) {
    const [key, value] = param.split('=');
    if (key === 'uuid') {
      return value;
    }
  }
  return null;
};

axios.get = jest.fn((url: string) => {
  const { endpoint, containsQuery } = getEndpoint(url);
  const endpoints = config.endpoints;

  switch (endpoint) {
    case endpoints.flows:
      if (containsQuery && containsUUIDQuery(url)) {
        const uuid = getUUIDQuery(url);
        switch (uuid) {
          case 'boring':
            return resolvePromise(boringFlowResp);
          default:
            throw new Error(`Axios mock: UUID query "${uuid}" not found`);
        }
      }
      return resolvePromise(flowsResp);
    case endpoints.groups:
      return resolvePromise(groupsResp);
    case endpoints.recipients:
      return resolvePromise(contactsResp);
    case endpoints.fields:
      return resolvePromise(fieldsResp);
    case endpoints.recipients:
      return resolvePromise(recipientsResp);
    case endpoints.labels:
      return resolvePromise(labelsResp);
    case endpoints.revisions:
      return resolvePromise(revisionsResp);
    default:
      throw new Error('Axios mock: url not passed. Passed: ' + url);
  }
});

module.exports = axios;
