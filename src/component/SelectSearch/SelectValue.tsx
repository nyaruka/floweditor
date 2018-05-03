// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import { Asset, AssetType } from '../../services/AssetService';

export interface SelectValueProps {
    value: Asset;
    onRemove: any;
}

export default class SelectValue extends React.PureComponent<SelectValueProps, {}> {
    constructor(props: SelectValueProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    private getIcon(): JSX.Element {
        if (this.props.value.type === AssetType.Group) {
            return <span className="icn-group" />;
        }
        return null;
    }

    private handleRemove(): void {
        this.props.onRemove(this.props.value);
    }

    public render(): JSX.Element {
        return (
            <div className="Select-value">
                <span
                    data-spec="remove-button"
                    onClick={this.handleRemove}
                    className="Select-value-icon"
                >
                    x
                </span>
                <span className="Select-value-label">
                    {this.getIcon()} {this.props.value.name}
                </span>
            </div>
        );
    }
}
