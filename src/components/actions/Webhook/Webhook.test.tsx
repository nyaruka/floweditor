import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import Webhook from './Webhook';

const definition = {
    name: 'Lots of Action',
    language: 'eng',
    uuid: 'a4f64f1b-85bc-477e-b706-de313a022979',
    localization: {
        spa: {
            '24afc61e-e528-4ac0-b887-78cebd39f12b': {
                text: ['Como te llamas?']
            }
        }
    },
    nodes: [
        {
            uuid: '3463f68f-c1af-4737-bdfb-1ac8525c1ff5',
            router: {
                type: 'switch',
                operand: '@webhook',
                cases: [
                    {
                        uuid: '89f37d36-a718-44e8-915f-c70d39c9b345',
                        type: 'has_webhook_status',
                        arguments: ['S'],
                        exit_uuid: 'd0470cca-52da-4008-8dec-bfb02babf934'
                    }
                ],
                default_exit_uuid: '968054cc-e110-4daf-a4cc-0b7dac145c27'
            },
            exits: [
                {
                    uuid: 'd0470cca-52da-4008-8dec-bfb02babf934',
                    name: 'Success'
                },
                {
                    uuid: '968054cc-e110-4daf-a4cc-0b7dac145c27',
                    name: 'Failure',
                    destination_node_uuid: null
                }
            ],
            actions: [
                {
                    uuid: '360a28a1-6741-4f16-9421-f6f313cf753e',
                    type: 'call_webhook',
                    url: 'https://www.nyaruka.com',
                    headers: {},
                    method: 'GET',
                    body: null
                }
            ]
        }
    ],
    _ui: {
        languages: [
            {
                eng: 'English'
            },
            {
                spa: 'Spanish'
            }
        ],
        nodes: {
            '3463f68f-c1af-4737-bdfb-1ac8525c1ff5': {
                position: {
                    x: 479,
                    y: 234
                },
                type: 'webhook'
            }
        }
    }
};

const { language: flowLanguage, nodes: [node] } = definition;

const { actions: [webhookAction] } = node;

const { uuid, type, url } = webhookAction;

describe('Component: Webhook', () => {
    it('should render Webhook with url prop', () => {
        const WebhookDivShallow = shallow(<Webhook {...webhookAction} />);

        expect(WebhookDivShallow.text()).toBe(url);
    });
});
