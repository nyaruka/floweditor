import * as React from 'react';
import { Operators } from '../config/operatorConfigs';
import { Types } from '../config/typeConfigs';
import { createCase, createExit, createWaitRouterNode } from '../testUtils/assetCreators';
import { Modal, ModalProps } from './Modal';
import { composeComponentTestUtils } from '../testUtils';

const waitForRespTitle = <div key={'front'}>Wait for Response</div>;

const rulesMeta = [
    { exitUUID: 'exit-1', exitName: 'Yes', type: Operators.has_any_word, args: ['y, yes'] },
    { exitUUID: 'exit-2', exitName: 'No', type: Operators.has_any_word, args: ['n, no'] },
    {
        exitUUID: 'exit-3',
        exitName: 'No Response',
        type: Operators.has_wait_timed_out,
        args: ['@run']
    }
];

const exits = rulesMeta.map(({ exitUUID, exitName }, idx) =>
    createExit({
        uuid: exitUUID,
        name: exitName,
        destination_node_uuid: `node-${idx}`
    })
);

const cases = rulesMeta.map(({ exitUUID, type, args }, idx) =>
    createCase({
        uuid: `case-${idx}`,
        type,
        exit_uuid: exitUUID,
        args
    })
);

const nodeToEdit = createWaitRouterNode({
    exits,
    cases,
    timeout: 300
});

const baseProps: ModalProps = {
    show: true,
    buttons: {
        primary: { name: 'Save', onClick: jest.fn() },
        secondary: { name: 'Cancel', onClick: jest.fn() }
    },
    __className: 'waitForResponse',
    title: [waitForRespTitle],
    width: '600px',
    translating: false,
    nodeToEdit,
    type: Types.wait_for_response
};

const { setup, spyOn } = composeComponentTestUtils(Modal, baseProps);

describe(Modal.name, () => {
    describe('render', () => {
        it('should render timeout control', () => {
            const { wrapper } = setup(false, {}, {}, {}, {}, [<div key={1} />, <div key={2} />]);

            expect(wrapper.find('Connect(TimeoutControl)').exists()).toBeTruthy();
            expect(wrapper).toMatchSnapshot();
        });
    });
});
