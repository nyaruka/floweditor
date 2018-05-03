// tslint:disable:ban-types
import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { Asset, AssetType } from '../../services/AssetService';
import * as styles from './SelectSearch.scss';

interface SelectOptionProps {
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
    private handleMouseEnter(): void {
        this.props.onFocus(this.props.option, event);
    }

    private handleMouseMove(): void {
        if (this.props.isFocused) {
            return;
        }
        this.props.onFocus(this.props.option, event);
    }

    private getIcon(): JSX.Element {
        if (this.props.option.type === AssetType.Group) {
            return <span className="icn-group" />;
        }
        return null;
    }

    public render(): JSX.Element {
        return (
            <div
                className={this.props.className}
                onMouseDown={this.handleMouseDown}
                onMouseEnter={this.handleMouseEnter}
                onMouseMove={this.handleMouseMove}
            >
                <div>
                    {this.getIcon()} {this.props.option.name}
                </div>
            </div>
        );
    }
}
