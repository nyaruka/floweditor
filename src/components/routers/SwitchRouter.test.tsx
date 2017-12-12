import * as React from 'react';
import { shallow } from 'enzyme';
import SwitchRouterForm, { getListStyle, getItemStyle } from './SwitchRouter';

describe('SwitchRouter', () => {
    describe('style utils', () => {
        describe('getListStyle', () => {
            it('should return "pointer" cursor style when passed a falsy isDraggingOver arg', () => {
                expect(getListStyle(false)).toEqual({
                    cursor: 'pointer'
                });
            });

            it('should return "move" cursor style when passed a truthy isDraggingOver arg', () => {
                expect(getListStyle(true)).toEqual({
                    cursor: 'move'
                });
            });
        });

        describe('getItemStyle', () => {
            const notDraggingStyle = {
                transition: null,
                transform: null,
                pointerEvents: 'auto',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                touchAction: 'manipulation'
            };

            const draggingStyle = {
                position: 'fixed',
                boxSizing: 'border-box',
                pointerEvents: 'none',
                zIndex: 5000,
                width: 595,
                height: 28,
                top: 271.3333435058594,
                left: 318.66668701171875,
                margin: 0,
                transform: 'translate(-2px, 17px)',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                touchAction: 'manipulation'
            };

            it('should return notDragging style when passed a falsy isDragging arg (snapshot)', () => {
                expect(getItemStyle(notDraggingStyle, false)).toMatchSnapshot();
            });

            it('should return dragging style when passed a truthy isDragging arg (snapshot)', () => {
                expect(getItemStyle(draggingStyle, true)).toMatchSnapshot();
            });
        });
    });
});
