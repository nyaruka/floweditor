import { composeComponentTestUtils } from '../../testUtils/index';
import LabelsElement, { LabelsElementProps } from './LabelsElement';

const baseProps: LabelsElementProps = {};

const { setup, spyOn } = composeComponentTestUtils(LabelsElement, baseProps);

describe(LabelsElement.name, () => {});
