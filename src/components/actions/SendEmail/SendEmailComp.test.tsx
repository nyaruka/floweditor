import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import { IWithActionProps } from '../../enhancers/withAction';
import EditorConfig from '../../../services/EditorConfig';
import CompMap from '../../../services/ComponentMap';
import LocalizationService, { LocalizedObject } from '../../../services/Localization';
import { languages } from '../../../flowEditorConfig';
import SendEmailCompEnhanced, { SendEmailCompBase } from './SendEmailComp';

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

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition as any);

const Localization: LocalizedObject = LocalizationService.translate(
    sendEmailAction,
    flowLanguage,
    languages
);

const sendEmailProps = {
    subject
};

const actionProps = {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    ComponentMap,
    node,
    action: sendEmailAction,
    context: {
        eventHandler: {
            onUpdateAction: jest.fn(),
            onUpdateRouter: jest.fn(),
            onUpdateLocalizations: jest.fn(),
            onUpdateDimensions: jest.fn(),
            onNodeBeforeDrag: jest.fn(),
            onNodeDragStart: jest.fn(),
            onNodeDragStop: jest.fn(),
            onRemoveAction: jest.fn(),
            onMoveActionUp: jest.fn(),
            onDisconnectExit: jest.fn(),
            onNodeMoved: jest.fn(),
            onAddAction: jest.fn(),
            onRemoveNode: jest.fn(),
            openEditor: jest.fn(),
            onNodeMounted: jest.fn()
        }
    },
    dragging: false,
    hasRouter: false,
    first: true,
    Localization
};

const sendEmailCompProps: IWithActionProps = {
    ...sendEmailProps,
    ...actionProps
};

describe('Component: SendEmailComp', () => {
    it('should render enhanced SendEmailComp and pass it appropriate props', () => {
        const SendEmailCompEnhancedShallow = shallow(
            <SendEmailCompEnhanced {...sendEmailCompProps} />
        );
        const SendEmailCompShallow = SendEmailCompEnhancedShallow.find({ type });

        expect(SendEmailCompShallow).toBePresent();
        expect(SendEmailCompShallow).toHaveProp('uuid', uuid);
        expect(SendEmailCompShallow).toHaveProp('emails', emails);
        expect(SendEmailCompShallow).toHaveProp('subject', subject);
        expect(SendEmailCompShallow).toHaveProp('body', body);
    });

    it("should render base SendEmailComp with subject prop", () => {
        const SendEmailCompBaseShallow = shallow(<SendEmailCompBase {...sendEmailProps} />);

        expect(SendEmailCompBaseShallow).toHaveText(subject);
    });
});
