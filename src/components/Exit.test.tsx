import * as React from 'react';
import '../enzymeAdapter';
import { shallow } from 'enzyme';
import { languages } from '../flowEditorConfig';
import { LocalizedObject } from '../services/Localization';
import Plumber from '../services/Plumber';
import ActivityManager from '../services/ActivityManager';
import ExitComp, { IExitProps } from './Exit';

const {
    results: [{ definition, uuid: flowUUID }]
} = require('../../test_flows/a4f64f1b-85bc-477e-b706-de313a022979.json');

const Activity = new ActivityManager(flowUUID, definition);

const Localization: LocalizedObject = new LocalizedObject(
    {
        uuid: '10e2b6f4-8587-463e-9248-a6069d4897d6'
    },
    'spa',
    languages
);

const exitProps: IExitProps = {
    Activity,
    exit: {
        uuid: '10e2b6f4-8587-463e-9248-a6069d4897d6'
    },
    onDisconnect: jest.fn(),
    Localization,
    plumberMakeSource: jest.fn(),
    plumberRemove: jest.fn(),
    plumberConnectExit: jest.fn()
};

const ExitCompShallow = shallow(<ExitComp {...exitProps} />);

describe('Component: ExitComp', () => {
    it('should mount', () => {
        expect(ExitCompShallow).toBePresent();
        expect(ExitCompShallow).toHaveState('confirmDelete', false);
    });
});
