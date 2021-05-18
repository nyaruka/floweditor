import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { Operator } from 'config/interfaces';
import { createUUID } from 'utils';

export const createEmptyCase = (operator: Operator): CaseProps => {
  const uuid = createUUID();
  return {
    uuid,
    kase: {
      uuid,
      type: operator.type,
      arguments: [''],
      category_uuid: null
    },
    categoryName: '',
    valid: true
  };
};
