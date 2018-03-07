import { Language } from '../component/LanguageSelector';
import { FlowDefinition } from '../flowTypes';

export type Flows = Array<{ uuid: string; name: string }>

export interface ReduxState {
    language: Language;
    translating: boolean;
    fetchingFlow: boolean;
    definition: FlowDefinition;
    nodeDragging: boolean;
    flows: Flows;
    dependencies: FlowDefinition[];
}

const initialState: ReduxState = {
    translating: false,
    language: null,
    fetchingFlow: false,
    definition: null,
    nodeDragging: false,
    flows: [],
    dependencies: null
};

export default initialState;
