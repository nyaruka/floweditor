import * as React from 'react';
import '../../enzyme.adapter';
import { shallow } from 'enzyme';
import { Editor } from './Editor';
import { FlowLoader } from './FlowLoader';
import { editorConfig } from '../__tests__/flow-editor-config'; 
import { getSpecWrapper, validUUID } from '../__tests__/utils';

const EditorShallow = shallow(<Editor config={editorConfig} />);

describe('Editor Component', () => {
    it('Initializes with expected state', () => {
        const flowUUID: string = editorConfig.flow; 
        expect(EditorShallow).toBePresent();
        expect(EditorShallow).toHaveState('flowUUID', flowUUID);
    });

    it('Renders the editor div', () => {
        const editorDivShallow = getSpecWrapper(EditorShallow, 'editor');
        expect(editorDivShallow).toBePresent();
    });

    it('Renders a FlowLoader component with valid key and props', () => {
        const FlowLoaderShallow = EditorShallow.find(FlowLoader);
        expect(FlowLoaderShallow).toBePresent();
        expect(validUUID(FlowLoaderShallow.key())).toBeTruthy();
        expect(FlowLoaderShallow).toHaveProp('uuid');
        expect(validUUID(FlowLoaderShallow.prop('uuid'))).toBeTruthy();
    });
});
