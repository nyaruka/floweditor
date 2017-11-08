import * as React from 'react';
import '../../../enzymeAdapter';
import { shallow } from 'enzyme';
import { IWithActionExternalProps } from '../../enhancers/withAction';
import EditorConfig from '../../../services/EditorConfig';
import CompMap from '../../../services/ComponentMap';
import LocalizationService, { LocalizedObject } from '../../../services/Localization';
import { languages } from '../../../flowEditorConfig';
import WebhookCompEnhanced, { WebhookCompBase } from './WebhookComp';

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

const {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints
} = new EditorConfig();

const ComponentMap = new CompMap(definition as any);

const Localization: LocalizedObject = LocalizationService.translate(
    webhookAction,
    flowLanguage,
    languages
);

const actionProps: IWithActionExternalProps = {
    typeConfigList,
    operatorConfigList,
    getTypeConfig,
    getOperatorConfig,
    endpoints,
    ComponentMap,
    node,
    action: webhookAction,
    onUpdateAction: jest.fn(),
    onUpdateRouter: jest.fn(),
    onUpdateLocalizations: jest.fn(),
    openEditor: jest.fn(),
    onMoveActionUp: jest.fn(),
    onRemoveAction: jest.fn(),
    dragging: false,
    hasRouter: false,
    first: true,
    Localization
};


describe('Component: WebhookComp', () => {
    it('should render enhanced WebhookComp and pass it appropriate props', () => {
        const WebhookCompEnhancedShallow = shallow(
            <WebhookCompEnhanced {...actionProps} />
        );
        const WebhookCompShallow = WebhookCompEnhancedShallow.find({ type });

        expect(WebhookCompShallow).toBePresent();
        expect(WebhookCompShallow).toHaveProp('uuid', uuid);
        expect(WebhookCompShallow).toHaveProp('url', url);
    });

    it('should render base WebhookComp with url prop', () => {
        const WebhookCompBaseShallow = shallow(<WebhookCompBase {...webhookAction} />);

        expect(WebhookCompBaseShallow).toHaveText(url);
    });
});
