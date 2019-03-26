import { DropResult } from 'react-beautiful-dnd';
import CaseList, { CaseListProps, CaseProps } from '~/components/flow/routers/caselist/CaseList';
import { Operators } from '~/config/interfaces';
import { composeComponentTestUtils, mock } from '~/testUtils';
import * as utils from '~/utils';

mock(utils, 'createUUID', utils.seededUUIDs());

const caseUUID1 = utils.createUUID();
const caseUUID2 = utils.createUUID();

const { setup } = composeComponentTestUtils<CaseListProps>(CaseList, {
    cases: [
        {
            uuid: caseUUID1,
            kase: {
                uuid: caseUUID1,
                type: Operators.has_any_word,
                arguments: ['Red, r'],
                category_uuid: '38c1m4g4-b424-585d-8cgi-384d6260ymca'
            },
            categoryName: 'Red',
            valid: true
        },
        {
            uuid: caseUUID2,
            kase: {
                uuid: caseUUID2,
                type: Operators.has_any_word,
                arguments: ['Green, g'],
                category_uuid: '38c1m4g4-b424-585d-8cgi-384d6260ymca'
            },
            categoryName: 'Green',
            valid: true
        }
    ],
    onCasesUpdated: jest.fn()
});

describe(CaseList.name, () => {
    describe('render', () => {
        it('should render empty list', () => {
            const { wrapper } = setup(false, { $set: { cases: [] } });
            expect(wrapper).toMatchSnapshot();
        });

        it('should render list of cases', () => {
            const { wrapper } = setup(false);
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('updates', () => {
        it('should remove cases', () => {
            const { instance } = setup(false);
            instance.handleRemoveCase(caseUUID1);
            expect(instance.state).toMatchSnapshot();
        });

        it('should update cases', () => {
            const { instance, props } = setup(false);
            instance.handleUpdateCase({
                ...props.cases[0],
                categoryName: 'Updated Exit Name'
            } as CaseProps);
            expect(instance.state).toMatchSnapshot();
        });

        it('should allow reordering', () => {
            const { instance } = setup(false);
            instance.handleDragEnd({
                draggableId: caseUUID2,
                source: { index: 1 },
                destination: { index: 0 }
            } as DropResult);
            expect(instance.state).toMatchSnapshot();
        });
    });
});
