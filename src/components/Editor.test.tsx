import * as React from 'react';
import '../../enzyme.adapter'; 
import { shallow } from 'enzyme';
import { Editor } from './Editor';
import { FlowLoader } from './FlowLoader';  
import { getSpecWrapper, validUUID } from '../../__tests__/utils'; 

const __flow_editor_config__: FlowEditorConfig = {
    endpoints: {
        contacts: '../assets/contacts.json',
        fields: '../assets/fields.json',
        flow: 'a4f64f1b-85bc-477e-b706-de313a022979',
        flows: '../assets/flows.json',
        groups: '../assets/groups.json',
        languages: {
            eng: 'English',
            spa: 'Spanish'
        }
    },
    flow: 'a4f64f1b-85bc-477e-b706-de313a022979'
};

const EditorWrapper = shallow(<Editor config={__flow_editor_config__} />); 

describe('Editor Component', () => {
    it ('Initializes with proper state, { flowUUID: this.props.config.flow }', () => {
        const { flow: flowUUID }: string = __flow_editor_config__; 
        expect(EditorWrapper).toBePresent(); 
        expect(EditorWrapper).toHaveState('flowUUID', flowUUID); 
    }); 

    it ('Renders the editor div', () => {
        const editorDivWrapper = getSpecWrapper(EditorWrapper, 'editor'); 
        expect(editorDivWrapper).toBePresent(); 
    }); 

    it('Renders a FlowLoader component with valid key and props', () => {
        const FlowLoaderWrapper = EditorWrapper.find(FlowLoader);
        expect(FlowLoaderWrapper).toBePresent(); 
        expect(validUUID(FlowLoaderWrapper.key())).toBeTruthy(); 
        expect(FlowLoaderWrapper).toHaveProp('uuid'); 
        expect(validUUID(FlowLoaderWrapper.prop('uuid'))).toBeTruthy(); 
    });
});
