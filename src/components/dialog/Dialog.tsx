import * as React from 'react';
import Button, { ButtonProps, ButtonTypes } from '~/components/button/Button';
import { renderIf } from '~/utils';

const styles = require('./Dialog.scss');
const shared = require('~/components/shared.scss');

export enum HeaderStyle {
    NORMAL = 'normal',
    BARBER = 'barber'
}

export interface ButtonSet {
    primary: ButtonProps;
    secondary?: ButtonProps;
    tertiary?: ButtonProps;
}

export interface Tab {
    name: string;
    body: JSX.Element;
    hasErrors?: boolean;
    icon?: string;
    checked?: boolean;
}

interface Buttons {
    leftButtons: JSX.Element[];
    rightButtons: JSX.Element[];
}

export interface DialogProps {
    title: string;
    subtitle?: string;
    headerIcon?: string;
    headerClass?: string;
    headerStyle?: HeaderStyle;
    buttons?: ButtonSet;
    gutter?: JSX.Element;
    noPadding?: boolean;
    tabs?: Tab[];
}

export interface DialogState {
    activeTab: number;
}

/**
 * A component that has a front and back and can flip back and forth between them
 */
export default class Dialog extends React.Component<DialogProps, DialogState> {
    constructor(props: DialogProps) {
        super(props);
        this.state = {
            activeTab: -1
        };
    }

    public showTab(index: number): void {
        this.setState({ activeTab: index });
    }

    private handlePrimaryButton(onClick: any): void {
        onClick();

        // focus on a tab with errors
        (this.props.tabs || []).forEach((tab: Tab, index: number) => {
            if (tab.hasErrors) {
                this.setState({ activeTab: index });
                return;
            }
        });

        // or focus on the main content
        this.setState({ activeTab: -1 });
    }

    private getButtons(): Buttons {
        const rightButtons: JSX.Element[] = [];
        const buttons = this.props.buttons || { primary: null, secondary: null, tertiary: null };

        if (buttons.secondary) {
            rightButtons.push(
                <Button key={0} type={ButtonTypes.secondary} {...buttons.secondary} />
            );
        }

        if (buttons.primary) {
            rightButtons.push(
                <Button
                    key={1}
                    onClick={() => {
                        this.handlePrimaryButton(buttons.primary.onClick);
                    }}
                    name={buttons.primary.name}
                    disabled={buttons.primary.disabled}
                    type={ButtonTypes.primary}
                />
            );
        }

        const leftButtons: JSX.Element[] = [];

        // Our left most button if we have one
        if (buttons.tertiary) {
            leftButtons.push(<Button key={0} type={ButtonTypes.tertiary} {...buttons.tertiary} />);
        }

        return {
            leftButtons,
            rightButtons
        };
    }

    public render(): JSX.Element {
        const headerClasses = [styles.header];

        if (this.state.activeTab > -1) {
            headerClasses.push(styles.clickable);
        }

        if (this.props.headerClass) {
            headerClasses.push(shared[this.props.headerClass]);
        }

        if (this.props.headerIcon) {
            headerClasses.push(styles.iconed);
        }

        if (this.props.headerStyle === HeaderStyle.BARBER) {
            headerClasses.push(styles.barber);
        }

        const activeClasses = [styles.dialog];
        const { leftButtons, rightButtons } = this.getButtons();

        return (
            <div className={activeClasses.join(' ')}>
                {(this.props.tabs || []).length > 0 ? (
                    <div className={styles.tabs}>
                        {(this.props.tabs || []).map((tab: Tab, index: number) => (
                            <div
                                key={'tab_' + tab.name}
                                className={
                                    styles.tab +
                                    ' ' +
                                    (index === this.state.activeTab ? styles.active : '')
                                }
                                onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
                                    evt.stopPropagation();
                                    this.setState({ activeTab: index });
                                }}
                            >
                                {tab.name}{' '}
                                {tab.icon ? (
                                    <span className={styles.tabIcon + ' ' + tab.icon} />
                                ) : null}
                                {tab.checked ? (
                                    <span className={styles.tabIcon + ' fe-check'} />
                                ) : null}
                            </div>
                        ))}
                    </div>
                ) : null}
                <div
                    onClick={() => {
                        this.setState({ activeTab: -1 });
                    }}
                    className={headerClasses.join(' ')}
                >
                    {this.state.activeTab > -1 ? <div className={styles.headerOverlay} /> : null}
                    {renderIf(this.props.headerIcon !== undefined)(
                        <span className={`${styles.headerIcon} ${this.props.headerIcon}`} />
                    )}
                    <div className={styles.titleContainer}>
                        <div className={styles.title}>{this.props.title}</div>
                        <div className={styles.subtitle}>{this.props.subtitle}</div>
                    </div>
                </div>
                <div className={this.props.noPadding ? '' : styles.content}>
                    {this.state.activeTab > -1
                        ? this.props.tabs[this.state.activeTab].body
                        : this.props.children}
                </div>

                <div className={styles.footer}>
                    <div className={styles.gutter}>{this.props.gutter}</div>
                    {renderIf(rightButtons.length > 0 || leftButtons.length > 0)(
                        <div className={styles.buttons}>
                            <div className={styles.leftButtons}>{leftButtons}</div>
                            <div className={styles.rightButtons}>{rightButtons}</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
