// tslint:disable:ban-types
import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { Asset, AssetType } from '../../services/AssetService';
import * as styles from './SelectSearch.scss';

interface SelectValueProps {
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
                <span onClick={this.handleRemove} className="Select-value-icon">
                    x
                </span>
                <span className="Select-value-label">
                    {this.getIcon()} {this.props.value.name}
                </span>
            </div>
        );
    }
}
