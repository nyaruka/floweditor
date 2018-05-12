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
import { validate, validateRequired } from '../../../store/validators';
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
        this.props.updateStartSessionForm({
            recipients: validate('Recipients', selected, [validateRequired])
        });
    }

    public handleFlowChanged(selected: Asset[]): void {
        this.props.updateStartSessionForm({
            flow: validate('Flow', selected[0], [validateRequired])
        });
    }

    public render(): JSX.Element {
        return (
            <div>
                <OmniboxElement
                    data-spec="recipients"
                    name="Recipients"
                    assets={this.context.assetService.getRecipients()}
                    onChange={this.handleRecipientsChanged}
                    entry={this.props.form.recipients}
                    add={true}
                />
                <p>Select a flow to run</p>
                <FlowElement
                    name="Flow"
                    onChange={this.handleFlowChanged}
                    assets={this.context.assetService.getFlowAssets()}
                    entry={this.props.form.flow}
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
