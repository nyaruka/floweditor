import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as $ from 'jquery';

// Configure Enzyme adapter
configure({ adapter: new Adapter() });

// RAF shim
(global as any).requestAnimationFrame = callback => {
    setTimeout(callback, 0);
};

// Make jest aware of our jQuery dep
(window as any).$ = $;
