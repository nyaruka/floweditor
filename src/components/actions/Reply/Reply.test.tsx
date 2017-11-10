import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import Reply from './Reply';

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

const { actions: [replyAction] } = node;

const { uuid, text } = replyAction;

describe('Component: Reply', () => {
    it('should render Reply with text prop when passed', () => {
        const ReplyDivShallow = shallow(<Reply {...replyAction} />);

        expect(ReplyDivShallow.text()).toBe(text);
    });

    it("should render Reply with placeholder when text prop isn't passed", () => {
        const ReplyDivShallow = shallow(<Reply {...{...replyAction, text: ''}} />);

        expect(ReplyDivShallow.text()).toBe('Send a message to the contact');
    });
});
