import {Plumber} from './services/Plumber'
import {FlowComp} from './components/Flow'
import {NodeComp} from './components/Node'

export interface FlowContext {
    flow: FlowComp;
    node?: NodeComp;
}


export interface UIMetaDataProps {
    location: LocationProps;
}

export interface LocationProps {
    x: number;
    y: number;
}

export interface NodeEditorProps {
    type: string;
    uuid: string;
}

export interface ActionProps extends NodeEditorProps{
    
}

export interface AddToGroupProps extends ActionProps {
    name: string;
}

export interface SaveToContactProps extends ActionProps {
    name: string;
}

export interface SendMessageProps extends ActionProps {
    text: string;
}

export interface SetLanguageProps extends ActionProps {
    language: string;
}

export interface ExitProps {
    uuid: string;
    destination: string;
    name: string;

    totalExits?: number;
    first?: boolean;
}

export interface NodeProps {
    uuid: string;
    exits?: ExitProps[];
    router?: any;
    actions?: ActionProps[];
    wait?: any;
    _ui: UIMetaDataProps;
}
