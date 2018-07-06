import update from 'immutability-helper';
import { casePropsFromNode } from '~/components/flow/routers/SwitchRouter';
import { getTypeConfig } from '~/config';
import { Types } from '~/config/typeConfigs';
import { FlowDefinition, FlowNode, SwitchRouter } from '~/flowTypes';
import { AssetType } from '~/services/AssetService';
import { getFlowComponents } from '~/store/helpers';
import { NodeEditorForm } from '~/store/nodeEditor';
import { composeComponentTestUtils, setMock } from '~/testUtils';

import { NodeEditor, NodeEditorProps } from './NodeEditor';

jest.mock('uuid', () => ({
    v4: jest.fn()
}));

const colorsFlow = require('~/test/flows/colors.json') as FlowDefinition;

const switchWithTimeout: FlowNode = update(colorsFlow.nodes[1], {
    wait: { $merge: { timeout: 300 } }
});

const baseProps: NodeEditorProps = {
    language: { id: 'eng', name: 'English', type: AssetType.Language },
    suggestedNameCount: 1,
    incrementSuggestedResultNameCount: jest.fn(),
    form: {} as NodeEditorForm,
    nodeEditorOpen: true,
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
    settings: { showAdvanced: false, originalNode: switchWithTimeout }
};

const { setup, spyOn } = composeComponentTestUtils(NodeEditor, baseProps);

describe(NodeEditor.name, () => {
    describe('instance methods', () => {
        describe('updateSwitchRouter', () => {
            it('should update switch router', () => {
                const { wrapper, instance, props } = setup(true, {
                    onUpdateRouter: setMock()
                });
                const kases = casePropsFromNode({
                    nodeToEdit: props.settings.originalNode,
                    handleCaseChanged: jest.fn(),
                    handleCaseRemoved: jest.fn()
                });

                instance.updateSwitchRouter(kases);

                expect(props.onUpdateRouter).toHaveBeenCalledTimes(1);
            });
        });
    });
});
