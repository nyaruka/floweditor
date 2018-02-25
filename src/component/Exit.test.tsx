import * as React from 'react';
import { shallow } from 'enzyme';
import { LocalizedObject } from '../services/Localization';
import Plumber from '../services/Plumber';
import ActivityManager from '../services/ActivityManager';
import ExitComp, { ExitProps } from './Exit';

const { languages } = require('../../assets/config');
const {
    results: [{ definition, uuid: flowUUID }]
} = require('../../assets/flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const Activity = new ActivityManager(flowUUID, definition);

const localization: LocalizedObject = new LocalizedObject(
    {
        uuid: '10e2b6f4-8587-463e-9248-a6069d4897d6'
    },
    'spa',
    languages
);

const exitProps: ExitProps = {
    Activity,
    exit: definition.nodes[0].exits[0],
    translating: false,
    onDisconnect: jest.fn(),
    localization,
    plumberMakeSource: jest.fn(),
    plumberRemove: jest.fn(),
    plumberConnectExit: jest.fn()
};

describe('ExitComp >', () => {
    describe('render >', () => {
        const wrapper = shallow(<ExitComp {...exitProps} />);

        it('should mount', () => {
            expect(wrapper.exists()).toBeTruthy();
            expect(wrapper.state('confirmDelete')).toBeFalsy();
        });
    });
});
