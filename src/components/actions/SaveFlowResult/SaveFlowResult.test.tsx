import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import SaveFlowResult from './SaveFlowResult';

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
            uuid: '24afc61e-e528-4ac0-b887-78cebd39f12b',
            actions: [
                {
                    type: 'reply',
                    uuid: '360a28a1-6741-4f16-9421-f6f313cf753e',
                    text: 'Hi there, what is your name?'
                }
            ],
            exits: [
                {
                    uuid: '445fc64c-2a18-47cc-89d0-15172826bfcc',
                    destination: null,
                    destination_node_uuid: '17f42c2a-0a46-4c6c-ac3e-c416d487e44a'
                }
            ]
        },
        {
            uuid: '17f42c2a-0a46-4c6c-ac3e-c416d487e44a',
            router: {
                type: 'switch',
                default_exit_uuid: 'cf9d9cdc-da00-4b0c-8162-5b0c7b9216f4',
                cases: [],
                operand: '@input',
                result_name: 'name '
            },
            exits: [
                {
                    uuid: 'cf9d9cdc-da00-4b0c-8162-5b0c7b9216f4',
                    name: 'All Responses',
                    destination_node_uuid: 'c63699de-4d3d-4b87-acec-2a96f806535d'
                }
            ],
            wait: {
                type: 'msg'
            }
        },
        {
            uuid: 'c63699de-4d3d-4b87-acec-2a96f806535d',
            actions: [
                {
                    uuid: 'e0d4b5a7-286b-4de8-bb29-7cf1fb2c57b7',
                    type: 'save_flow_result',
                    result_name: 'name',
                    value: '@run.results.name',
                    category: ''
                }
            ],
            exits: [
                {
                    name: null,
                    uuid: '29a41cd0-2302-4943-913d-4913b5d05343',
                    destination_node_uuid: null
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
            '24afc61e-e528-4ac0-b887-78cebd39f12b': {
                position: {
                    x: 20,
                    y: 20
                }
            },
            '17f42c2a-0a46-4c6c-ac3e-c416d487e44a': {
                position: {
                    x: 356,
                    y: 194
                },
                type: 'wait_for_response'
            },
            'c63699de-4d3d-4b87-acec-2a96f806535d': {
                position: {
                    x: 27,
                    y: 347
                }
            }
        }
    }
};

const { language: flowLanguage, nodes: [, , node]} = definition;

const { actions: [saveFlowResultAction]} = node;

const { uuid, type, value, result_name } = saveFlowResultAction;

describe('Component: SaveFlowResult', () => {
    it("should render SaveFlowResult with 'save...' div when value prop passed", () => {
        const SaveFlowResultDivShallow = shallow(<SaveFlowResult {...saveFlowResultAction} />);

        expect(SaveFlowResultDivShallow).toHaveText(`Save ${value} as ${result_name}`);
    });

    it("should render SaveFlowResult with 'clear...' div when value prop isn't passed", () => {
        const SaveFlowResultDivShallow = shallow(<SaveFlowResult {...{...saveFlowResultAction, value: ''}} />);

        expect(SaveFlowResultDivShallow).toHaveText(`Clear value for ${result_name}`);
    });
});
