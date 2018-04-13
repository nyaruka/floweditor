import { Sticky, STICKY_SPEC_ID, StickyProps } from './Sticky';
import { createSetup, createSpy, getSpecWrapper } from '../../testUtils';
import { FlowDefinition, StickyNote } from '../../flowTypes';
import { getBaseLanguage, dump } from '../../utils';
import { ConnectionEvent, createStore, initialState } from '../../store';
import { object } from 'prop-types';
import { endpointsPT, languagesPT } from '../../config/ConfigProvider';
import * as styles from './Sticky.scss';
import * as config from '../../../assets/config';

jest.useFakeTimers();

// TODO: this is an awful lot of boilerplate for testing a simple component
const definition = require('../../../__test__/empty.json') as FlowDefinition;
const { languages, endpoints } = config;

const sticky: StickyNote = {
    title: 'Sticky Title',
    body: 'Sticky Body',
    position: { left: 100, top: 200 }
};

const baseProps: StickyProps = {
    uuid: 'stickyA',
    sticky,
    definition,
    plumberClearDragSelection: jest.fn(),
    plumberRemove: jest.fn(),
    plumberDraggable: jest.fn(),
    updateSticky: jest.fn(),
    onResetDragSelection: jest.fn()
};

const context = {
    languages,
    endpoints,
    store: createStore({
        ...initialState,
        flowContext: { ...initialState.flowContext, definition }
    })
};

const childContextTypes = {
    store: object,
    endpoints: endpointsPT,
    languages: languagesPT
};

const setup = createSetup<StickyProps>(Sticky, baseProps, context, childContextTypes);
const spyOnSticky = createSpy(Sticky);

describe(Sticky.name, () => {
    describe('colors', () => {
        it('should render yellow as a default', () => {
            const { wrapper } = setup({}, false);
            expect(wrapper.find('.stickyContainer').hasClass('yellow')).toBeTruthy();
        });

        it('should render green notes', () => {
            sticky.color = 'green';
            const { wrapper } = setup({ sticky }, false);
            expect(wrapper.find('.stickyContainer').hasClass('green')).toBeTruthy();
        });

        it('should let you change the color', () => {
            const { wrapper } = setup({}, false);
            wrapper.find('.colorChooser .blue').simulate('click');
            expect(wrapper.find('.stickyContainer').hasClass('blue')).toBeTruthy();
        });
    });

    describe('update content', () => {
        const updateText = (name: string, value: string) => {
            const { wrapper } = setup({}, false);
            wrapper.find('textarea.' + name).prop('onChange')({
                currentTarget: { value }
            });
            expect(wrapper.find('textarea.' + name).text()).toBe(value);
        };

        it('should update the title', () => {
            updateText('title', 'My new title');
        });

        it('should update the body', () => {
            updateText('body', 'My new body');
        });

        it('should debounce multiple updates', () => {
            updateText('title', 'Update one');
            updateText('title', 'Update two');

            // TODO: make clearTimeout mock work
            // expect(clearTimeout).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should show confirmation when clicking remove', () => {
            const { wrapper } = setup({}, false);

            // starts off without the removal class
            expect(wrapper.find('.titleWrapper').hasClass('removal')).toBeFalsy();

            // click on the removal, and removal should be there
            wrapper.find('.removeButton').simulate('click');
            expect(wrapper.find('.titleWrapper').hasClass('removal')).toBeTruthy();

            // run through the end of the timer period and removal should go away
            jest.runAllTimers();

            expect(
                wrapper
                    .render()
                    .find('.titleWrapper')
                    .hasClass('removal')
            ).toBeFalsy();
        });

        it('should delete on double click', () => {
            const { wrapper, props } = setup({ updateSticky: jest.fn() }, false);

            // click on the removal, and removal should be there
            wrapper.find('.removeButton').simulate('click');
            wrapper.find('.removeButton').simulate('click');

            // TODO: make mocks work
            expect(props.updateSticky).toHaveBeenCalledTimes(1);
            expect(props.updateSticky).toHaveBeenCalledWith('stickyA', null);

            // run through the end of the timer period and removal should go away
            jest.runAllTimers();
        });
    });
});
