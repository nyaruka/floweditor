import * as React from 'react';
import { shallow } from 'enzyme';
import CompMap from '../../services/ComponentMap';
import NodeEditor, { NodeEditorProps, mapExits, isSwitchForm, getAction } from './index';
import { getBaseLanguage } from '../';
import { V4_UUID } from '../../utils';
import { getTypeConfig, typeConfigList } from '../../config';

const {
    results: [{ definition }]
} = require('../../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');
const { languages } = require('../../../assets/config');

const { nodes: [node], language: flowLanguage } = definition;

const { actions: [replyAction] } = node;

const ComponentMap = new CompMap(definition);

const nodeEditorProps: NodeEditorProps = {
    language: getBaseLanguage(languages),
    translating: false,
    show: true,
    definition,
    node,
    action: replyAction,
    onUpdateAction: jest.fn(),
    onUpdateRouter: jest.fn(),
    onUpdateLocalizations: jest.fn(),
    ComponentMap
};

describe('NodeEditor >', () => {
    describe('helpers >', () => {
        describe('mapExits >', () =>
            it('should return a map of exits', () => {
                const exit = {
                    uuid: '63e20770-64c1-4bad-bd73-a34cf6d46866',
                    name: 'All Responses',
                    destination_node_uuid: null
                };

                expect(mapExits([exit])).toEqual({
                    [exit.uuid]: exit
                });
            }));

        describe('isSwitchForm >', () => {
            it('should return true if argument is a type that maps to a switch router form, false otherwise', () => {
                [
                    'wait_for_response',
                    'split_by_expression',
                    'split_by_group',
                    'reply'
                ].forEach((type, idx, arr) => {
                    if (idx === arr.length - 1) {
                        expect(isSwitchForm(type)).toBeFalsy();
                    } else {
                        expect(isSwitchForm(type)).toBeTruthy();
                    }
                });
            });
        });

        describe('getAction >', () => {
            it('should return action in props if props arg contains an action & that action is of the same type as the config arg', () => {
                expect(getAction(nodeEditorProps, getTypeConfig('reply'))).toEqual(replyAction);
            });

            it("should return action in props if props arg contains an action & that action is only of the same type as the config's alias", () => {
                const typesWithAliases = [
                    ['wait_for_response', 'switch'],
                    ['start_flow', 'subflow'],
                    ['call_webhook', 'webhook'],
                    ['save_contact_field', 'update_contact']
                ];

                typesWithAliases
                    .map(typeArr => getTypeConfig(typeArr[0]))
                    .forEach((config, idx) => {
                        expect(
                            getAction(
                                {
                                    ...nodeEditorProps,
                                    action: { ...replyAction, type: typesWithAliases[idx][0] }
                                },
                                config
                            )
                        ).toEqual(expect.objectContaining({ type: config.type }));
                    });
            });

            it("should return obj containing the config arg's type if props arg contains action that isn't of the same type as the config arg or its alias", () => {
                const config = getTypeConfig('start_flow');

                expect(getAction(nodeEditorProps, config)).toEqual(
                    expect.objectContaining({
                        type: config.type
                    })
                );
            });

            it("should return obj containing an existing action UUID if props arg contains action that isn't of the same type as the config arg or its alias", () => {
                expect(getAction(nodeEditorProps, getTypeConfig('start_flow'))).toEqual(
                    expect.objectContaining({
                        uuid: replyAction.uuid
                    })
                );
            });

            it("should return default action obj if props arg doesn't contain action whose type matches that of the config arg", () => {
                typeConfigList.forEach(config => {
                    expect(getAction({ ...nodeEditorProps, action: undefined }, config)).toEqual(
                        expect.objectContaining({
                            type: config.type,
                            uuid: expect.stringMatching(V4_UUID)
                        })
                    );
                });
            });
        });
    });

    describe('render >', () => {
        it('should render itself, Modal', () => {
            const wrapper = shallow(<NodeEditor {...nodeEditorProps} />);

            const modal = wrapper.find('Modal');

            expect(modal.prop('__className')).toBe(replyAction.type);
            expect(modal.prop('title')).toEqual([
                <div key={'front'}>Send Message</div>,
                <div key={'advanced'}>
                    <div>Send Message</div>
                    <div className="advanced_title">Advanced Settings</div>
                </div>
            ]);
        });
    });
});
