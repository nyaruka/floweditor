import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet, HeaderStyle } from '~/components/dialog/Dialog';
import Flipper from '~/components/flipper/Flipper';
import {
    getLocalizedObjects,
    getOriginal,
    LocalizedType
} from '~/components/flow/routers/localization/helpers';
import TextInputElement from '~/components/form/textinput/TextInputElement';
import { UpdateLocalizations } from '~/components/nodeeditor/NodeEditor';
import { getOperatorConfig } from '~/config/operatorConfigs';
import { Type } from '~/config/typeConfigs';
import { Case, Exit } from '~/flowTypes';
import { Asset } from '~/services/AssetService';
import { FormState, mergeForm, NodeEditorSettings } from '~/store/nodeEditor';

import * as styles from '~/components/flow/routers/localization/RouterLocalizationForm.scss';

export interface RouterLocalizationFormProps {
    language: Asset;
    nodeSettings: NodeEditorSettings;
    typeConfig: Type;
    updateLocalizations(languageCode: string, localizations: any[]): UpdateLocalizations;
    onClose(canceled: boolean): void;
}

export interface RouterLocalizationFormState extends FormState {
    exits: Exit[];
    cases: Case[];
}

export default class RouterLocalizationForm extends React.Component<
    RouterLocalizationFormProps,
    RouterLocalizationFormState
> {
    constructor(props: RouterLocalizationFormProps) {
        super(props);

        const exits: Exit[] = getLocalizedObjects(props.nodeSettings, LocalizedType.Exit) as Exit[];
        const cases: Case[] = getLocalizedObjects(props.nodeSettings, LocalizedType.Case) as Case[];

        this.state = { exits, cases, valid: true };

        bindCallbacks(this, {
            include: [/^handle/]
        });
    }

    private handleUpdate(keys: { exit?: Exit; kase?: Case }): boolean {
        const updates: Partial<RouterLocalizationFormState> = {};

        if (keys.hasOwnProperty('exit')) {
            updates.exits = [keys.exit];
        }

        if (keys.hasOwnProperty('kase')) {
            updates.cases = [keys.kase];
        }

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private handleUpdateExitName(exit: Exit, name: string): boolean {
        exit.name = name;
        return this.handleUpdate({ exit });
    }

    private handleUpdateCaseArgument(kase: Case, arg: string): boolean {
        kase.arguments = [arg];
        return this.handleUpdate({ kase });
    }

    private handleSave(): void {
        // collect up our exit localizations
        const translations: any[] = this.state.exits.map((exit: Exit) => {
            return exit.name
                ? {
                      uuid: exit.uuid,
                      translations: {
                          name: exit.name
                      }
                  }
                : { uuid: exit.uuid };
        });

        // same thing for any cases
        translations.push(
            ...this.state.cases.map((kase: Case) => {
                return kase.arguments
                    ? {
                          uuid: kase.uuid,
                          translations: {
                              arguments: kase.arguments
                          }
                      }
                    : { uuid: kase.uuid };
            })
        );

        this.props.updateLocalizations(this.props.language.id, translations);

        // notify our modal we are done
        this.props.onClose(false);
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public renderCases(): JSX.Element[] {
        return this.state.cases.map((kase: Case) => {
            const originalCase = getOriginal(
                this.props.nodeSettings,
                LocalizedType.Case,
                kase.uuid
            ) as Case;

            const { verboseName } = getOperatorConfig(originalCase.type);

            const [orginalArgument] = originalCase.arguments;

            let argument = '';
            if (kase.arguments && kase.arguments.length > 0) {
                argument = kase.arguments[0];
            }

            return (
                <div
                    key={`translate_${kase.uuid}`}
                    data-spec="operator-field"
                    className={styles.translating_operator_container}
                >
                    <div data-spec="verbose-name" className={styles.translating_operator}>
                        {verboseName}
                    </div>
                    <div data-spec="argument-to-translate" className={styles.translating_from}>
                        {orginalArgument}
                    </div>
                    <div className={styles.translating_to}>
                        <TextInputElement
                            data-spec="localize-case"
                            name={kase.uuid}
                            placeholder={`${this.props.language.name} Translation`}
                            showLabel={false}
                            onChange={(arg: string) => this.handleUpdateCaseArgument(kase, arg)}
                            entry={{ value: argument }}
                        />
                    </div>
                </div>
            );
        });
    }

    public renderExits(): JSX.Element[] {
        return this.state.exits.map((exit: Exit) => {
            const originalExit = getOriginal(
                this.props.nodeSettings,
                LocalizedType.Exit,
                exit.uuid
            );

            const placeholder = `${this.props.language.name} Translation`;

            if (!exit.name) {
                exit.name = '';
            }

            return (
                <div key={exit.uuid} className={styles.translating_exit}>
                    <div data-spec="exit-name" className={styles.translating_from}>
                        {originalExit.name}
                    </div>
                    <div className={styles.translating_to}>
                        <TextInputElement
                            data-spec="localize-exit"
                            name={exit.name}
                            placeholder={placeholder}
                            showLabel={false}
                            entry={{ value: exit.name }}
                            onChange={(name: string) => this.handleUpdateExitName(exit, name)}
                        />
                    </div>
                </div>
            );
        });
    }

    public render(): JSX.Element {
        return (
            <Flipper
                front={
                    <Dialog
                        title={`${this.props.language.name} Category Names`}
                        headerClass={this.props.typeConfig.type}
                        buttons={this.getButtons()}
                    >
                        <p data-spec="instructions">
                            When category names are referenced later in the flow, the appropriate
                            language for the category will be used. If no translation is provided,
                            the original text will be used.
                        </p>
                        {this.renderExits()}
                    </Dialog>
                }
                back={
                    <Dialog
                        title={`${this.props.language.name} Rules`}
                        headerStyle={HeaderStyle.BARBER}
                        headerClass={this.props.typeConfig.type}
                        headerIcon="fe-cog"
                        subtitle="Advanced Settings"
                        buttons={this.getButtons()}
                    >
                        <p data-spec="instructions">
                            Sometimes languages need special rules to route things properly. If a
                            translation is not provided, the original rule will be used.
                        </p>
                        {this.renderCases()}
                    </Dialog>
                }
            />
        );
    }
}
