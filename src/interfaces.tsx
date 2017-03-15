import {Plumber} from './services/Plumber'
import FlowComp from './components/Flow'

export interface UIMetaDataProps {
    location: LocationProps;
}

export interface LocationProps {
    x: number;
    y: number;
}

export interface ActionProps {
    type: string;
    uuid: string;
}

export interface AddToGroupProps extends ActionProps {
    label: string;
}

export interface SaveToContactProps extends ActionProps {
    label: string;
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
    label: string;

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

    flow: FlowComp;
}
