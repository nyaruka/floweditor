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

const EditorShallow = shallow(<Editor config={__flow_editor_config__} />); 

describe('Editor Component', () => {
    it ('Initializes with expected state', () => {
        const { flow: flowUUID }: string = __flow_editor_config__; 
        expect(EditorShallow).toBePresent(); 
        expect(EditorShallow).toHaveState('flowUUID', flowUUID); 
    }); 

    it ('Renders the editor div', () => {
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
