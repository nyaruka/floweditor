import * as classNames from 'classnames/bind';
import * as React from 'react';

import { isRealValue, renderIf } from '../../utils';
import * as styles from './CheckboxElement.scss';
import { FormElementProps } from './FormElement';

interface CheckboxElementProps extends FormElementProps {
    checked: boolean;
    title?: string;
    description?: string;
    labelClassName?: string;
    checkboxClassName?: string;
    onChange?(checked: boolean): void;
}

interface CheckboxState {
    checked: boolean;
}

const cx = classNames.bind(styles);

export default class CheckboxElement extends React.Component<CheckboxElementProps, CheckboxState> {
    constructor(props: any) {
        super(props);

        this.state = {
            checked: this.props.checked
        };

        this.onChange = this.onChange.bind(this);
    }

    private onChange(event: any): void {
        this.setState({ checked: !this.state.checked }, () => {
            if (this.props.onChange) {
                this.props.onChange(this.state.checked);
            }
        });
    }

    public validate(): boolean {
        return true;
    }

    public render(): JSX.Element {
        const checkboxIcon = this.state.checked ? 'fe-check-square' : 'fe-square';
        return (
            <label className={cx(styles.label, this.props.labelClassName)} onClick={this.onChange}>
                <span className={cx(checkboxIcon, this.props.checkboxClassName)} />
                {renderIf(isRealValue(this.props.title))(
                    <div className={styles.title}>{this.props.title}</div>
                )}
                {renderIf(isRealValue(this.props.description))(
                    <div className={this.props.title ? styles.description : styles.descriptionSolo}>
                        {this.props.description}
                    </div>
                )}
            </label>
        );
    }
}
