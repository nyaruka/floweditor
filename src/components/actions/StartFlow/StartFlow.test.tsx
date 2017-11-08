import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import StartFlow from './StartFlow';

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
            uuid: 'f1f9320e-4b7c-4b3a-baa2-88dfe08f5491',
            router: {
                type: 'switch',
                operand: '@child',
                cases: [
                    {
                        uuid: '776cc8fc-1312-4321-8ac9-8d6c8629f27d',
                        type: 'has_run_status',
                        arguments: ['C'],
                        exit_uuid: '97065e15-f793-4ff2-8ae6-80bbc4df4566'
                    }
                ],
                default_exit_uuid: null
            },
            exits: [
                {
                    uuid: '97065e15-f793-4ff2-8ae6-80bbc4df4566',
                    name: 'Complete'
                }
            ],
            actions: [
                {
                    uuid: '81736952-436a-476e-ac4f-604cbfe3a004',
                    type: 'start_flow',
                    flow_name: 'Collect Child Details',
                    flow_uuid: '23ff7152-b588-43e4-90de-fda77aeaf7c0'
                }
            ],
            wait: {
                type: 'flow',
                flow_uuid: '23ff7152-b588-43e4-90de-fda77aeaf7c0'
            }
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
            'f1f9320e-4b7c-4b3a-baa2-88dfe08f5491': {
                position: {
                    x: 526,
                    y: 199
                },
                type: 'subflow'
            }
        }
    }
};

const { nodes: [node], language: flowLanguage } = definition;

const { actions: [startFlowAction]} = node;

const { uuid, type, flow_name, flow_uuid } = startFlowAction;

describe('Component: StartFlow', () => {
    it('should render StartFlow with flow name', () => {
        const StartFlowDivShallow = shallow(<StartFlow {...startFlowAction} />);

        expect(StartFlowDivShallow).toHaveText(flow_name);
    });
});
