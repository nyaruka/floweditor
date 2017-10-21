import * as React from 'react';
import '../../enzyme.adapter'; 
import { mount } from 'enzyme';
import { FlowLoader } from './FlowLoader';  
import { Flow } from './Flow'; 
import { getSpecWrapper } from '../../__tests__/utils'; 

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

const { flow: uuid }: string = __flow_editor_config__; 

const FlowLoaderShallow = mount(<FlowLoader key={uuid} uuid={uuid} />);
const FlowLoaderReact = mount(<FlowLoader key={uuid} uuid={uuid} />); 

describe('FlowLoader Component', () => {
    it('Renders', () => {
        expect(FlowLoaderShallow).toBePresent(); 
    }); 

    it('Initializes with expected state', () => {}); 
}); 