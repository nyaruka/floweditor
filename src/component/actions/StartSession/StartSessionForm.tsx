import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Type } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { StartSession } from '../../../flowTypes';
import { Asset } from '../../../services/AssetService';
import { AppState, DispatchWithState } from '../../../store';
import { StartSessionFunc, updateStartSessionForm } from '../../../store/forms';
import { StartSessionFormState } from '../../../store/nodeEditor';
import FlowElement from '../../form/FlowElement';
import OmniboxElement from '../../form/OmniboxElement';
import { StartSessionFormHelper } from './StartSessionFormHelper';

export interface StartSessionFormStoreProps {
    typeConfig: Type;
    form: StartSessionFormState;
    updateStartSessionForm: StartSessionFunc;
}

export interface StartSessionFormPassedProps {
    action: StartSession;
    formHelper: StartSessionFormHelper;
    updateAction(action: StartSession): void;
    onBindWidget(ref: any): void;
}

export type StartSessionFormProps = StartSessionFormStoreProps & StartSessionFormPassedProps;

export class StartSessionForm extends React.Component<
    StartSessionFormProps,
    StartSessionFormState
> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: StartSessionFormProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public onValid(): void {
        const action = this.props.formHelper.stateToAction(this.props.action.uuid, this.props.form);
        this.props.updateAction(action);
    }

    public handleRecipientsChanged(selected: Asset[]): void {
        this.props.updateStartSessionForm({ recipients: selected });
    }

    public handleFlowChanged(selected: Asset[]): void {
        this.props.updateStartSessionForm({ flow: selected[0] });
    }

    public render(): JSX.Element {
        return (
            <div>
                <OmniboxElement
                    data-spec="recipients"
                    ref={this.props.onBindWidget}
                    name="Recipients"
                    assets={this.context.assetService.getRecipients()}
                    selected={this.props.form.recipients}
                    add={true}
                    required={true}
                    onChange={this.handleRecipientsChanged}
                />
                <p>Select a flow to run</p>
                <FlowElement
                    ref={this.props.onBindWidget}
                    name="Flow"
                    onChange={this.handleFlowChanged}
                    assets={this.context.assetService.getFlowAssets()}
                    flow={this.props.action.flow}
                    required={true}
                />
            </div>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({ nodeEditor: { typeConfig, form } }: AppState) => ({
    typeConfig,
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators(
        {
            updateStartSessionForm
        },
        dispatch
    );

const ConnectedStartSessionForm = connect(mapStateToProps, mapDispatchToProps, null, {
    withRef: true
})(StartSessionForm);

export default ConnectedStartSessionForm;
