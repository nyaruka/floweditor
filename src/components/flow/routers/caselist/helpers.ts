import { CaseProps } from 'components/flow/routers/caselist/CaseList';
import { Operators } from 'config/interfaces';
import { createUUID } from 'utils';

export const createEmptyCase = (): CaseProps => {
  const uuid = createUUID();
  return {
    uuid,
    kase: {
      uuid,
      type: Operators.has_any_word,
      arguments: [''],
      category_uuid: null
    },
    categoryName: '',
    valid: true
  };
};
