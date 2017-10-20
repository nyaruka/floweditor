import * as React from 'react';
import '../../enzyme.adapter'; 
import { mount } from 'enzyme';
import { Editor } from './Editor';
import { FlowLoader } from './FlowLoader';  
import { validUUID } from '../../__tests__/utils'; 

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

describe('Editor Component', () => {
    it('Renders a FlowLoader', () => {
        const EditorWrapper = mount(<Editor config={__flow_editor_config__} />);
        const FlowLoaderWrapper = EditorWrapper.find(FlowLoader);
        expect(FlowLoaderWrapper).toBePresent(); 
        expect(validUUID(FlowLoaderWrapper.key())).toBeTruthy(); 
        expect(FlowLoaderWrapper).toHaveProp('uuid'); 
    });
});
