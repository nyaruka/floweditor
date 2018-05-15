// tslint:disable:ban-types
import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';

import { Asset } from '../../services/AssetService';
import { getIconForAssetType } from './helper';

export interface SelectOptionProps {
    className: string;
    isFocused: boolean;
    option: Asset;

    onFocus: Function;
    onSelect: Function;
}

export default class SelectOption extends React.PureComponent<SelectOptionProps, {}> {
    constructor(props: SelectOptionProps) {
        super(props);
        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    private handleMouseDown(event: any): void {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSelect(this.props.option, event);
    }
    private handleMouseEnter(event: any): void {
        this.props.onFocus(this.props.option, event);
    }

    private handleMouseMove(event: any): void {
        if (this.props.isFocused) {
            return;
        }
        this.props.onFocus(this.props.option, event);
    }

    public render(): JSX.Element {
        return (
            <div
                className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
            >
                <>
                    {getIconForAssetType(this.props.option.type)} {this.props.option.name}
                </>
            </div>
        );
    }
}
