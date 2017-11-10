import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import SendEmail from './SendEmail';

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
                    uuid: '360a28a1-6741-4f16-9421-f6f313cf753e',
                    type: 'send_email',
                    body:
                        'Mixtape vinyl blog drinking vinegar. Butcher taxidermy artisan, trust fund direct trade forage activated charcoal meh pickled. Kickstarter typewriter la croix chicharrones shabby chic beard pok pok green juice fingerstache pickled kombucha meh palo santo. ',
                    subject: 'Alo!',
                    emails: ['kellan@nyaruka.com']
                }
            ],
            exits: [
                {
                    name: null,
                    uuid: '445fc64c-2a18-47cc-89d0-15172826bfcc'
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

const { language: flowLanguage, nodes: [node] } = definition;


const { actions: [sendEmailAction] } = node;

const { uuid, type, subject, body, emails } = sendEmailAction;

describe('Component: SendEmail', () => {
    it("should render SendEmail with subject prop", () => {
        const SendEmailDivShallow = shallow(<SendEmail {...sendEmailAction} />);

        expect(SendEmailDivShallow.text()).toBe(subject);
    });
});
