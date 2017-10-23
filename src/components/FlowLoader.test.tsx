import * as React from 'react';
import '../../enzyme.adapter'; 
import { shallow, mount } from 'enzyme';
import { FlowLoader } from './FlowLoader';  
import { Flow } from './Flow'; 
import { editorConfig } from '../../__tests__/flow-editor-config'; 
import { getSpecWrapper } from '../../__tests__/utils'; 

const uuid: string = editorConfig.flow; 

// const FlowLoaderShallow = shallow(<FlowLoader key={uuid} uuid={uuid} />);
// const FlowLoaderReact = mount(<FlowLoader key={uuid} uuid={uuid} />); 

describe.skip('FlowLoader Component', () => {
    it('Renders', () => {
        // expect(FlowLoaderShallow).toBePresent(); 
    }); 

    it('Initializes with expected state', () => {}); 
}); 