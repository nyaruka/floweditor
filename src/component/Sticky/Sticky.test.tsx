import { Sticky, STICKY_SPEC_ID, StickyProps } from './Sticky';
import { createSetup, createSpy, getSpecWrapper } from '../../testUtils';
import { FlowDefinition, StickyNote } from '../../flowTypes';
import { getBaseLanguage, dump } from '../../utils';
import { ConnectionEvent, createStore, initialState, updateSticky } from '../../store';
import { object } from 'prop-types';
import { endpointsPT, languagesPT } from '../../config/ConfigProvider';
import * as styles from './Sticky.scss';
import * as config from '../../../assets/config';

jest.useFakeTimers();

// TODO: this is an awful lot of boilerplate for testing a simple component
const definition = require('../../../__test__/empty.json') as FlowDefinition;
const { languages, endpoints } = config;

const clearTimeoutMock = clearTimeout as jest.Mock;

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
            const { wrapper } = setup({}, true);
            expect(wrapper.find('.stickyContainer').hasClass('yellow')).toBeTruthy();
        });

        it('should render green notes', () => {
            sticky.color = 'green';
            const { wrapper } = setup({ sticky }, true);
            expect(wrapper.find('.stickyContainer').hasClass('green')).toBeTruthy();
        });

        it('should let you change the color', () => {
            const { wrapper } = setup({}, true);
            wrapper.find('.colorChooser .blue').simulate('click');
            expect(wrapper.find('.stickyContainer').hasClass('blue')).toBeTruthy();
        });
    });

    describe('update content', () => {
        let wrapper;

        const updateText = (name: string, value: string) => {
            wrapper.find('textarea.' + name).prop('onChange')({
                currentTarget: { value }
            });
            expect(wrapper.find('textarea.' + name).text()).toBe(value);
        };

        it('should update the title', () => {
            wrapper = setup({}, false).wrapper;
            updateText('title', 'My new title');
        });

        it('should update the body', () => {
            wrapper = setup({}, false).wrapper;
            updateText('body', 'My new body');
        });

        it('should debounce multiple updates', () => {
            wrapper = setup({}, false).wrapper;
            updateText('title', 'Update one');
            updateText('title', 'Update two');

            // we should have cleared our debounce
            expect(clearTimeout).toHaveBeenCalledTimes(1);
        });

        it('should deregister debounce on unmount', () => {
            wrapper = setup({}, false).wrapper;
            updateText('title', 'Update one');
            updateText('title', 'Update two');
            clearTimeoutMock.mockClear();

            wrapper.unmount();
            expect(clearTimeout).toHaveBeenCalledTimes(1);
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
            const { wrapper, props } = setup({ updateSticky: jest.fn() }, true);

            // click on the removal, and removal should be there
            wrapper.find('.removeButton').simulate('click');
            wrapper.find('.removeButton').simulate('click');

            // TODO: make mocks work
            expect(props.updateSticky).toHaveBeenCalledTimes(1);
            expect(props.updateSticky).toHaveBeenCalledWith('stickyA', null);

            // run through the end of the timer period and removal should go away
            jest.runAllTimers();
        });

        it('should deregister timeout when unmounting', () => {
            const { wrapper } = setup({}, true);
            clearTimeoutMock.mockClear();

            // click to remove will register a timer to switch removal off
            wrapper.find('.removeButton').simulate('click');

            // unmounting should deregister our timer
            wrapper.unmount();
            expect(clearTimeout).toHaveBeenCalledTimes(1);
        });
    });

    describe('mounting', () => {
        it('should deregister from plumber on unmount', () => {
            const { wrapper, props } = setup({ plumberRemove: jest.fn() }, true);

            wrapper.unmount();
            expect(props.plumberRemove).toHaveBeenCalledTimes(1);
        });
    });

    describe('dragging', () => {
        it('should reset drag select on drag start', () => {
            const { props, instance } = setup(
                { plumberClearDragSelection: jest.fn(), onResetDragSelection: jest.fn() },
                true
            );

            // start dragging
            instance.onDragStart({});

            expect(props.plumberClearDragSelection).toHaveBeenCalledTimes(1);
            expect(props.onResetDragSelection).toHaveBeenCalledTimes(1);
        });

        it('should get coverage for a noop', () => {
            const { instance } = setup({}, true);
            instance.onDrag({});
        });

        it('should update the position when we are done dragging', () => {
            const { props, instance } = setup({ updateSticky: jest.fn() }, false);

            instance.onDragStop({ finalPos: [100, 200] });
            expect(props.updateSticky).toHaveBeenCalledWith(props.uuid, {
                body: 'Sticky Body',
                color: 'blue',
                position: { left: 100, top: 200 },
                title: 'Sticky Title'
            });
        });
    });
});
