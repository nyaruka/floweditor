// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import { Asset } from '../../services/AssetService';
import { renderIf } from '../../utils';
import { getIconForAssetType } from './helper';

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

    private handleRemove(): void {
        this.props.onRemove(this.props.value);
    }

    public render(): JSX.Element {
        return (
            <div className="Select-value">
                {renderIf(this.props.onRemove)(
                    <span
                        data-spec="remove-button"
                        onClick={this.handleRemove}
                        className="Select-value-icon"
                    >
                        x
                    </span>
                )}

                <span className="Select-value-label">
                    {getIconForAssetType(this.props.value.type)} {this.props.value.name}
                </span>
            </div>
        );
    }
}
