import update from 'immutability-helper';
import { v4 as generateUUID } from 'uuid';

import { getTypeConfig } from '../../config';
import { Types } from '../../config/typeConfigs';
import { FlowDefinition, FlowNode, SwitchRouter } from '../../flowTypes';
import { getFlowComponents } from '../../store/helpers';
import { composeComponentTestUtils, setMock } from '../../testUtils';
import { casePropsFromNode } from '../routers/SwitchRouter';
import { NodeEditor, NodeEditorProps } from './NodeEditor';

jest.mock('uuid', () => ({
    v4: jest.fn()
}));

const colorsFlow = require('../../../__test__/flows/colors.json') as FlowDefinition;

const switchWithTimeout: FlowNode = update(colorsFlow.nodes[1], {
    wait: { $merge: { timeout: 300 } }
});

const baseProps: NodeEditorProps = {
    nodeToEdit: switchWithTimeout,
    language: { iso: 'eng', name: 'English' },
    nodeEditorOpen: true,
    actionToEdit: null,
    localizations: [],
    definition: colorsFlow,
    translating: false,
    typeConfig: getTypeConfig(Types.wait_for_response),
    resultName: switchWithTimeout.router.result_name,
    showResultName: true,
    operand: (switchWithTimeout.router as SwitchRouter).operand,
    timeout: switchWithTimeout.wait.timeout,
    pendingConnection: null,
    nodes: getFlowComponents(colorsFlow).renderNodeMap,
    updateResultName: jest.fn(),
    updateOperand: jest.fn(),
    handleTypeConfigChange: jest.fn(),
    resetNodeEditingState: jest.fn(),
    updateNodeEditorOpen: jest.fn(),
    onUpdateLocalizations: jest.fn(),
    onUpdateAction: jest.fn(),
    onUpdateRouter: jest.fn(),
    updateUserAddingAction: jest.fn(),
    updateShowResultName: jest.fn(),
    plumberConnectExit: jest.fn(),
    plumberRepaintForDuration: jest.fn(),
    settings: { showAdvanced: false }
};

const { setup, spyOn } = composeComponentTestUtils(NodeEditor, baseProps);

describe(NodeEditor.name, () => {
    beforeEach(() => {
        // Make UUID generation deterministic so we can write reliable snapshots
        let uuidCount = 1;

        generateUUID.mockImplementation(() => `generated_uuid_${uuidCount++}`);
    });

    describe('instance methods', () => {
        describe('updateSwitchRouter', () => {
            it('should update switch router', () => {
                const { wrapper, instance, props } = setup(true, {
                    onUpdateRouter: setMock()
                });
                const kases = casePropsFromNode({
                    nodeToEdit: props.nodeToEdit,
                    handleCaseChanged: jest.fn(),
                    handleCaseRemoved: jest.fn()
                });

                instance.updateSwitchRouter(kases);

                expect(props.onUpdateRouter).toHaveBeenCalledTimes(1);
            });
        });
    });
});
