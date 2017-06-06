import * as React from 'react';
import { NodeForm } from "../NodeForm";
import { SwitchRouterProps, SwitchRouterState, SwitchRouterForm } from "./SwitchRouter";
import { StartFlow } from '../../FlowDefinition';
import { NodeModalProps } from "../NodeModal";
import { FlowElement } from "../form/FlowElement";


interface ExpressionProps extends SwitchRouterProps {

}

export class ExpressionForm extends SwitchRouterForm<ExpressionProps> {

}
