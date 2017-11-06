import * as React from 'react';
import { IRouter, IExit } from '../../flowTypes';
import NodeEditorForm, { INodeEditorFormState } from './NodeEditorForm';
import { LocalizedObject } from '../../services/Localization';
import { ILanguage } from '../LanguageSelector';
import { TextInputElement } from '../form/TextInputElement';
import Widget from './Widget';

const formStyles = require('./NodeEditor.scss');

abstract class NodeRouterForm<
    R extends IRouter,
    S extends INodeEditorFormState
> extends NodeEditorForm<S> {
    renderExitTranslations(ref: any): JSX.Element {
        // var cases: JSX.Element[] = [];
        var exits: JSX.Element[] = [];

        var language: ILanguage;
        if (this.props.localizations.length > 0) {
            language = this.props.localizations[0].getLanguage();
        }

        if (!language) {
            return null;
        }

        for (let exit of this.props.node.exits) {
            var localized = this.props.localizations.find((localizedObject: LocalizedObject) => {
                return localizedObject.getObject().uuid == exit.uuid;
            });
            if (localized) {
                var value = null;
                if ('name' in localized.localizedKeys) {
                    var localizedExit: IExit = localized.getObject();
                    value = localizedExit.name;
                }

                exits.push(
                    <div key={'translate_' + exit.uuid} className={formStyles.translating_exit}>
                        <div className={formStyles.translating_from}>{exit.name}</div>
                        <div className={formStyles.translating_to}>
                            <TextInputElement
                                ref={ref}
                                name={exit.uuid}
                                placeholder={language.name + ' Translation'}
                                showLabel={false}
                                value={value}
                                ComponentMap={this.props.ComponentMap}
                            />
                        </div>
                    </div>
                );
            }
        }

        return (
            <div>
                <div className={formStyles.title}>Categories</div>
                <div className={formStyles.instructions}>
                    When category names are referenced later in the flow, the appropriate language
                    for the category will be used. If no translation is provided, the original text
                    will be used.
                </div>
                <div className={formStyles.translating_exits}>{exits}</div>
            </div>
        );
    }

    saveLocalizedExits(widgets: { [name: string]: Widget }) {
        var exits = this.getLocalizedExits(widgets);
        var language = this.props.localizations[0].getLanguage().iso;
        this.props.updateLocalizations(language, exits);
    }

    getLocalizedExits(widgets: { [name: string]: Widget }): { uuid: string; translations: any }[] {
        var results: { uuid: string; translations: any }[] = [];
        for (let exit of this.props.node.exits) {
            var input = widgets[exit.uuid] as TextInputElement;
            var value = input.state.value.trim();
            if (value) {
                results.push({ uuid: exit.uuid, translations: { name: [value] } });
            } else {
                results.push({ uuid: exit.uuid, translations: null });
            }
        }
        return results;
    }

    public getInitial(): R {
        if (this.props.node.router) {
            return this.props.node.router as R;
        }
    }
}

export default NodeRouterForm;
