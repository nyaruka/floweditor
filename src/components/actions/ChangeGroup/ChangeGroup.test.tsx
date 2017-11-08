import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import ChangeGroup from './ChangeGroup';

const definition = {
    name: 'Lots of Action',
    language: 'eng',
    uuid: 'a4f64f1b-85bc-477e-b706-de313a022979',
    localization: {
        spa: {
            '24afc61e-e528-4ac0-b887-78cebd39f12b': {
                text: 'Como te llamas?'
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
                },
                {
                    uuid: 'd5293394-c6d4-407c-97da-8149faea24cf',
                    type: 'add_to_group',
                    groups: [
                        {
                            uuid: 'afaba971-8943-4dd8-860b-3561ed4f1fe1',
                            name: 'Testers'
                        }
                    ]
                }
            ],
            exits: [
                {
                    uuid: '445fc64c-2a18-47cc-89d0-15172826bfcc',
                    destination: null
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
            }
        }
    }
};

const { nodes: [node], language: flowLanguage } = definition;

const { actions: [, addToGroupAction] } = node;

const { uuid, type, groups: [{ name: groupName}] } = addToGroupAction;

describe('Component: ChangeGroup', () => {
    it('should render ChangeGroupComp with group name', () => {
        const ChangeGroupDivShallow = shallow(<ChangeGroup {...addToGroupAction} />);

        expect(ChangeGroupDivShallow).toHaveText(groupName);
    });
});



