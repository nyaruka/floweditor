import React from 'react';
import { v4 as generateUUID } from 'uuid';
import { V4_UUID } from '../../helpers/utils';
import { initialState, mapHeaders, getInitialState } from './WebhookRouter';
import { CallWebhook, Methods } from '../../flowTypes';

const action: CallWebhook = {
    type: 'call_webhook',
    uuid: generateUUID(),
    url: '',
    method: Methods.GET
};

const headers = {
    Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
};

describe('WebhookRouter >', () => {
    describe('helpers >', () => {
        describe('mapHeaders >', () => {
            it('should return a Header array', () => {
                const headerList = mapHeaders(headers);

                expect(headerList[0].name).toBe(Object.keys(headers)[0]);
                expect(headerList[0].value).toBe(headers[Object.keys(headers)[0]]);
                expect(headerList[0].uuid).toEqual(expect.stringMatching(V4_UUID));
            });
        });

        describe('getInitialState >', () => {
            it("should return initial state if action isn't of type 'call_webhook'", () => {
                expect(getInitialState({ ...action, type: 'reply' })).toEqual(initialState);
            });

            it("shouldn't add headers if action is of type 'call_webhook' but doesn't have headers", () => {
                expect(getInitialState(action)).toEqual(initialState);
            });

            it('should add headers if they exist on action', () => {
                const expectedState = {
                    ...initialState,
                    headers: [...mapHeaders(headers), ...initialState.headers]
                };

                const state = getInitialState({
                    ...action,
                    headers
                });

                expect(state.headers.length).toBe(2);
            });
        });
    });
});
