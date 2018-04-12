const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const $ = require('jquery');

// Configure Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

// RAF shim
global.requestAnimationFrame = callback => {
    setTimeout(callback, 0);
};

// Make jest aware of our jQuery dep
window.$ = $;
