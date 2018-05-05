import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import { ConfigProviderContext } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { Types } from '../../../config/typeConfigs';
import { AddLabels, Label } from '../../../flowTypes';
import AssetService, { Asset, AssetType } from '../../../services/AssetService';
import LabelsElement from '../../form/LabelsElement';
import { mapAssetsToGroups, mapGroupsToAssets } from '../ChangeGroups/helpers';

export interface AddLabelFormProps {
    action: AddLabels;
    onBindWidget: (ref: any) => void;
    updateAction: (action: AddLabels) => void;
}

export const mapLabelsToAssets = (labels: Label[]): Asset[] =>
    labels.map(({ name, uuid }) => ({ name, id: uuid, type: AssetType.Label }));

export const mapAssetsToLabels = (searchResults: Asset[]): Label[] =>
    searchResults.map(({ id, name }) => ({ uuid: id, name }));

export const LABEL = ' Select the label(s) to apply to the incoming message.';
export const PLACEHOLDER = 'Enter the name of an existing label or create a new one';

export const controlLabelSpecId = 'label';

export default class AddLabelsForm extends React.PureComponent<AddLabelFormProps> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: AddLabelFormProps, context: ConfigProviderContext) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/]
        });
    }

    public onValid(widgets: { [name: string]: any }): void {
        const { state: { labels } } = widgets.Labels;
        const newAction: AddLabels = {
            uuid: this.props.action.uuid,
            type: Types.add_input_labels,
            labels: mapAssetsToLabels(labels)
        };

        this.props.updateAction(newAction);
    }

    private getLabels(): Asset[] {
        if (!this.props.action.labels) {
            return [];
        }
        return mapLabelsToAssets(this.props.action.labels);
    }

    public render(): JSX.Element {
        return (
            <>
                <p data-spec={controlLabelSpecId}>{LABEL}</p>
                <LabelsElement
                    ref={this.props.onBindWidget}
                    name="Labels"
                    placeholder={PLACEHOLDER}
                    assets={this.context.assetService.getLabelAssets()}
                    labels={this.getLabels()}
                    add={true}
                    required={true}
                />
            </>
        );
    }
}
