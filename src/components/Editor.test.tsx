import * as React from 'react';
import '../enzymeAdapter';
import { shallow, mount } from 'enzyme';
import Editor, { IEditorProps } from './Editor';
import Flow from './Flow';
import { flowUUID } from '../flowEditorConfig';
import EditorConfig from '../services/EditorConfig';
import External from '../services/External';
import { getSpecWrapper } from '../helpers/utils';

const {
    results: [{ definition }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const editorProps: IEditorProps = {
    flowUUID,
    EditorConfig: new EditorConfig(),
    External: {
        getFlow: jest.fn(
            () =>
                new Promise((resolve, reject) =>
                    process.nextTick(() =>
                        resolve({
                            definition
                        })
                    )
                )
        )
    } as any
};

const EditorShallow = shallow(<Editor {...editorProps} />);

describe('Component: Editor', () => {
    it('Renders w/ expected state', () => {
        const {
            EditorConfig: { endpoints: { flows: flowsEndpoint } },
            External: { getFlow }
        } = editorProps;
        expect(EditorShallow).toBePresent();
        expect(getSpecWrapper(EditorShallow, 'editor')).toBePresent();
        expect(EditorShallow).toHaveState('flowUUID', flowUUID);
        expect(getFlow).toBeCalledWith(flowUUID, false, flowsEndpoint);
        expect(EditorShallow).toHaveState('definition', definition);
    });
});
