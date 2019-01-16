import * as React from 'react';
import CaseElement, { CaseElementProps } from '~/components/flow/routers/case/CaseElement';
import { getOperatorConfig, Operators } from '~/config/operatorConfigs';
import { composeComponentTestUtils, setMock } from '~/testUtils';

const caseUUID = '29b18c7e-c232-414c-9fc0-2e0b6260d9ca';
const { setup } = composeComponentTestUtils<CaseElementProps>(CaseElement, {
    name: `case_${caseUUID}`,
    kase: {
        uuid: caseUUID,
        type: Operators.has_any_word,
        arguments: [''],
        exit_uuid: '38c1m4g4-b424-585d-8cgi-384d6260ymca'
    },
    exitName: '',
    onRemove: jest.fn(),
    onChange: jest.fn()
});

describe(CaseElement.name, () => {
    describe('render', () => {
        it('should render empty case', () => {
            const { wrapper } = setup(true);
            expect(wrapper).toMatchSnapshot();
        });

        it('renders no argument rules', () => {
            const { wrapper } = setup(true, {
                $merge: {
                    kase: {
                        uuid: caseUUID,
                        type: Operators.has_number,
                        exit_uuid: '38c1m4g4-b424-585d-8cgi-384d6260ymca'
                    }
                }
            });
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('operator changes', () => {
        // we need a full renders because we update our category reference
        it('should handle updates', () => {
            const { instance } = setup(false);
            instance.handleOperatorChanged(getOperatorConfig(Operators.has_any_word));
            expect(instance.state).toMatchSnapshot();
        });

        it('should should set arguments for numeric range', () => {
            const { instance } = setup(false);
            instance.handleOperatorChanged(getOperatorConfig(Operators.has_number_between));
            expect(instance.state).toMatchSnapshot();
        });

        it('shouldnt update exit if it has been edited', () => {
            const { instance } = setup(false);
            instance.handleExitChanged('My Exit Name');
            instance.handleOperatorChanged(getOperatorConfig(Operators.has_any_word));
            expect(instance.state).toMatchSnapshot();
        });
    });

    describe('update', () => {
        it('handles removes', () => {
            const { instance, props } = setup(true, { onRemove: setMock() });
            instance.handleRemoveClicked();
            expect(props.onRemove).toHaveBeenCalled();
        });

        it('handles argument change', () => {
            const { instance } = setup(false);
            instance.handleArgumentChanged('Green');
            expect(instance.state).toMatchSnapshot();
        });

        it('handles multiple argument change', () => {
            const { instance } = setup(false);
            instance.handleOperatorChanged(getOperatorConfig(Operators.has_number_between));
            instance.handleMinChanged('1');
            instance.handleMaxChanged('100');
            expect(instance.state).toMatchSnapshot();
        });
    });
});
