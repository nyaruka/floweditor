import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import React from 'react';
import styles from './TranslatorTab.module.scss';
import i18n from 'config/i18n';
import { PopTab } from 'components/poptab/PopTab';
import { RenderNodeMap } from 'store/flowContext';
import { PopTabType, Type } from 'config/interfaces';
import { Action, Category } from 'flowTypes';
import { getTypeConfig } from 'config';
import {
  findTranslations,
  getMergedByType,
  TranslationState,
  getFriendlyAttribute,
  getBundleKey
} from './helpers';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import { OnUpdateLocalizations, UpdateTranslationFilters } from 'store/thunks';
import { getType } from 'config/typeConfigs';
import { fakePropType } from 'config/ConfigProvider';
import TembaSelect from 'temba/TembaSelect';
import { store } from 'store';
import { TembaAppState } from 'temba-components';

const cx: any = classNames.bind(styles);

export enum TranslationType {
  PROPERTY = 'property',
  CATEGORY = 'category',
  CASE = 'case'
}

export interface TranslationBundle {
  node_uuid: string;
  action_uuid?: string;
  translations: Translation[];
  translated: number;
  typeConfig: Type;
}

export interface Translation {
  type: TranslationType;
  uuid: string;
  attribute: string;
  from: string;
  to: string;
}

export interface TranslatorTabProps {
  localization: { [uuid: string]: any };
  translationFilters: { categories: boolean };
  nodes: RenderNodeMap;
  onToggled: (visible: boolean, tab: PopTabType) => void;
  onTranslationClicked: (bundle: TranslationBundle) => void;
  onTranslationOpened: (bundle: TranslationBundle) => void;
  onTranslationFilterChanged: UpdateTranslationFilters;
  popped: string;
  onUpdateLocalizations: OnUpdateLocalizations;
}

export interface TranslatorTabState {
  visible: boolean;
  selectedTranslation: Translation;
  translationBundles: TranslationBundle[];
  optionsVisible: boolean;
  pctComplete: number;
  translationFilters: { categories: boolean };
  translationModel: any;
  autoTranslating: boolean;
  language: string;
  languageNames: { [key: string]: string };
}

export class TranslatorTab extends React.Component<TranslatorTabProps, TranslatorTabState> {
  public static contextTypes = {
    config: fakePropType
  };

  private autoTranslateDialog: any;
  private translationCache: { [text: string]: string } = {};

  private unsubscribe: () => void;

  constructor(props: TranslatorTabProps, context: any) {
    super(props);
    const appState = store.getState();

    this.state = {
      visible: false,
      selectedTranslation: null,
      translationBundles: [],
      optionsVisible: false,
      pctComplete: 0,
      translationFilters: props.translationFilters || { categories: true },
      translationModel: null,
      autoTranslating: false,
      language: appState.languageCode,
      languageNames: appState.languageNames
    };

    // subscribe for changes
    this.unsubscribe = store
      .getApp()
      .subscribe((state: TembaAppState, prevState: TembaAppState) => {
        this.setState({
          language: state.languageCode,
          languageNames: state.languageNames
        });
      });

    bindCallbacks(this, {
      include: [/^handle/, /^render/, /^toggle/]
    });
  }

  public componentWillUnmount(): void {
    if (this.state.visible) {
      this.handleTabClicked();
    }
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public componentDidUpdate(prevProps: TranslatorTabProps, prevState: TranslatorTabState): void {
    if (
      prevProps.translationFilters !== this.props.translationFilters ||
      prevProps.localization !== this.props.localization ||
      prevState.language !== this.state.language ||
      !prevState.visible ||
      prevState.translationFilters !== this.state.translationFilters
    ) {
      this.handleUpdateTranslations();
      this.translationCache = {};
    }
  }

  private handleUpdateTranslations(): void {
    const translationBundles: TranslationBundle[] = [];
    Object.keys(this.props.nodes).forEach((node_uuid: string) => {
      const renderNode = this.props.nodes[node_uuid];

      // check for router level translations
      if (renderNode.node.router && this.state.translationFilters.categories) {
        const typeConfig = getTypeConfig(getType(renderNode));

        let translations: Translation[] = [];
        if (this.state.translationFilters.categories) {
          const localizeableKeys = ['name'];
          renderNode.node.router.categories.forEach((category: Category) => {
            translations.push(
              ...findTranslations(
                TranslationType.CATEGORY,
                category.uuid,
                localizeableKeys,
                category,
                this.props.localization
              )
            );
          });
        }

        if (translations.length > 0) {
          translationBundles.push({
            typeConfig,
            node_uuid,
            translations,
            translated: translations.filter((translation: Translation) => !!translation.to).length
          });
        }
      } else {
        // find attributes from each action
        renderNode.node.actions.forEach((action: Action) => {
          const typeConfig = getTypeConfig(action.type);
          const translations = findTranslations(
            TranslationType.PROPERTY,
            action.uuid,
            typeConfig.localizeableKeys || [],
            action,
            this.props.localization
          );

          if (translations.length > 0) {
            translationBundles.push({
              typeConfig,
              node_uuid,
              action_uuid: action.uuid,
              translations,
              translated: translations.filter((translation: Translation) => !!translation.to).length
            });
          }
        });
      }
    });

    const counts = { total: 0, complete: 0 };
    translationBundles.reduce((counts, bundle) => {
      counts.total += bundle.translations.length;
      counts.complete += bundle.translated;
      return counts;
    }, counts);

    const pctComplete = counts.total > 0 ? Math.round((counts.complete / counts.total) * 100) : 0;

    const bundles = translationBundles
      .filter((bundle: TranslationBundle) => bundle.translated < bundle.translations.length)
      .sort((a: TranslationBundle, b: TranslationBundle) => {
        return b.translations.length - b.translated - (a.translations.length - a.translated);
      });

    if (
      pctComplete !== this.state.pctComplete ||
      bundles.length !== this.state.translationBundles.length
    ) {
      this.setState({
        pctComplete,
        translationBundles: bundles
      });
    }
  }

  public handleTabClicked(): void {
    this.props.onToggled(!this.state.visible, PopTabType.TRANSLATOR_TAB);
    this.setState((prevState: TranslatorTabState) => {
      return { visible: !prevState.visible };
    });
  }

  public toggleOptions(): void {
    this.setState({ optionsVisible: !this.state.optionsVisible });
  }

  private toggleCategories(categories: boolean): void {
    this.setState({ translationFilters: { categories } }, () => {
      this.props.onTranslationFilterChanged(this.state.translationFilters);
    });
  }

  private renderMissing(key: string, from: string, summary: string) {
    if (from) {
      return (
        <div key={this.state.language + key} className={styles.item}>
          <div className={styles.text + ' ' + styles.from_text}>{from}</div>
          <div className={styles.text + ' ' + styles.attribute}>{summary}</div>
        </div>
      );
    }
    return null;
  }

  private handleTranslationClicked(bundle: TranslationBundle) {
    this.props.onTranslationClicked(bundle);
    this.props.onTranslationOpened(bundle);
  }

  private handleChangeLanguageClick(e: any): void {
    e.preventDefault();
    e.stopPropagation();
    this.context.config.onChangeLanguage(
      this.state.language,
      this.state.languageNames[this.state.language]
    );
  }

  private handleAutoTranslateClick(e: any): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.state.autoTranslating) {
      this.setState({ autoTranslating: false });
    } else {
      // lookup the default model first
      const store = document.querySelector('temba-store') as any;
      store.getResults('/api/internal/llms.json', { force: true }).then((results: any) => {
        if (results.length > 0) {
          this.setState({ translationModel: results[0] }, () => {
            this.autoTranslateDialog.primaryButtonName = 'Translate';
            this.autoTranslateDialog.cancelButtonName = 'Cancel';
            this.autoTranslateDialog.show();
          });
        } else {
          this.autoTranslateDialog.primaryButtonName = null;
          this.autoTranslateDialog.cancelButtonName = 'Ok';
          this.autoTranslateDialog.show();
        }
      });
    }
  }

  private async doAutoTranslation() {
    for (const bundle of this.state.translationBundles) {
      const translationUpdate: { uuid: string; translations: any }[] = [];
      const untranslated = bundle.translations.filter(
        (translation: Translation) => !translation.to
      );

      for (const translation of untranslated) {
        // don't try to translate single characters
        if (translation.from.length === 1) {
          continue;
        }

        // don't try to translate numbers
        if (translation.from.match(/^\d+$/)) {
          continue;
        }

        // if it's already in our cache, use that
        if (this.translationCache[translation.from]) {
          translationUpdate.push({
            uuid: translation.uuid,
            translations: { [translation.attribute]: this.translationCache[translation.from] }
          });
          continue;
        }

        const state = store.getState();
        const payload = {
          text: translation.from,
          lang: {
            from: {
              definition: state.flowDefinition,
              info: state.flowInfo
            },
            to: this.state.language
          }
        };

        await store
          .postJSON(`/llm/translate/${this.state.translationModel.uuid}/`, payload)
          .then((response: any) => {
            if (response.status === 200) {
              // cache the translation
              this.translationCache[translation.from] = response.json['result'];

              const result = response.json['result'] || response.json['text'];
              if (result) {
                translationUpdate.push({
                  uuid: translation.uuid,
                  translations: { [translation.attribute]: result }
                });
              }
            }
          });
      }

      this.props.onUpdateLocalizations(this.state.language, true, translationUpdate);

      // if we've been told to stop, break out of the loop
      if (!this.state.autoTranslating) {
        break;
      }

      // we don't want localization updates to stack up
      await new Promise(r => setTimeout(r, 1000));
    }

    this.setState({ autoTranslating: false });
  }

  private handleAutoTranslateButtonClicked(buttonEvent: any): void {
    const button = buttonEvent.detail.button;

    if (button.primary) {
      this.setState({ autoTranslating: true }, () => {
        this.autoTranslateDialog.hide();
        this.doAutoTranslation();
      });
    }
  }

  private handleLLMChanged(value: any): void {
    this.setState({ translationModel: value });
  }

  public render(): JSX.Element {
    // only show change button if container set up to handle it
    const showChangeButton = this.state.optionsVisible && this.context.config.onChangeLanguage;

    const classes = cx({
      [styles.visible]: this.state.visible,
      [styles.hidden]: this.props.popped && this.props.popped !== PopTabType.TRANSLATOR_TAB
    });

    const optionsClasses = cx({
      [styles.options]: true,
      [styles.options_visible]: this.state.optionsVisible,
      [styles.change_visible]: showChangeButton
    });

    const filledClasses = cx({
      [styles.filled]: true,
      [styles.hundredpct]: this.state.pctComplete === 100
    });

    const wrapperClasses = cx({
      [styles.translations_wrapper]: true,
      [styles.complete]: this.state.translationBundles.length === 0
    });

    let languageName = `${this.state.languageNames[this.state.language]}`;

    // truncate the name if it is too long
    const maxLength = 36;
    if (languageName.length > maxLength) {
      languageName = languageName.substring(0, maxLength - 3) + '...';
    }

    return (
      <div className={classes}>
        <PopTab
          className="translations"
          header={languageName}
          label={i18n.t('translation.header', 'Flow Translation')}
          color="#777"
          icon="language"
          top="120px"
          popTop="100px"
          visible={this.state.visible}
          onShow={this.handleTabClicked}
          onHide={this.handleTabClicked}
          custom={false}
        >
          <div key={'translation_wrapper'} className={wrapperClasses}>
            {this.state.translationBundles.map((bundle: TranslationBundle) => {
              return (
                <div
                  key={this.state.language + getBundleKey(bundle)}
                  className={styles.translate_block}
                  onClick={() => {
                    this.handleTranslationClicked(bundle);
                  }}
                >
                  <div className={styles.needs_translation}>
                    <div className={styles.type_name}>{bundle.typeConfig.name}</div>
                    {this.renderMissing(
                      getBundleKey(bundle) + 'categories',
                      getMergedByType(bundle, TranslationState.MISSING, TranslationType.CATEGORY),
                      getFriendlyAttribute('categories')
                    )}

                    {this.renderMissing(
                      getBundleKey(bundle) + 'rules',

                      getMergedByType(bundle, TranslationState.MISSING, TranslationType.CASE),
                      getFriendlyAttribute('cases')
                    )}
                    {bundle.translations
                      .filter(
                        translation =>
                          !translation.to && translation.type === TranslationType.PROPERTY
                      )
                      .map(translation =>
                        this.renderMissing(
                          getBundleKey(bundle) + translation.from,
                          translation.from,
                          getFriendlyAttribute(translation.attribute)
                        )
                      )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={optionsClasses} onClick={this.toggleOptions}>
            <div className={styles.header}>
              <div className={styles.progress_bar}>
                <div
                  style={{ width: `${this.state.pctComplete}%` }}
                  className={filledClasses}
                ></div>
              </div>
              <div className={styles.toggle}>
                <temba-icon name="up"></temba-icon>
              </div>
            </div>
            <div className={styles.filters}>
              <div className={styles.checkboxes}>
                <div>
                  <CheckboxElement
                    name={i18n.t('forms.categories', 'categories')}
                    checked={this.state.translationFilters.categories}
                    title={'Include categories'}
                    onChange={this.toggleCategories}
                  />
                </div>
              </div>
              <div className={styles.pct_complete}>{this.state.pctComplete}%</div>
            </div>
            <div className={styles.buttons}>
              {this.state.translationBundles.length > 0 && (
                <button
                  onClick={this.handleAutoTranslateClick}
                  className={this.state.autoTranslating ? styles.auto_translating : ''}
                >
                  {this.state.autoTranslating ? (
                    <div>
                      <div>Translating</div>
                      <temba-loading style={{ display: 'inline-flex' }}></temba-loading>
                    </div>
                  ) : (
                    i18n.t('forms.auto_translate', 'Auto Translate')
                  )}
                </button>
              )}
              {showChangeButton && !this.state.autoTranslating && (
                <button onClick={this.handleChangeLanguageClick}>
                  {i18n.t('forms.use_as_default_language', 'Make Default')}
                </button>
              )}
            </div>
          </div>
        </PopTab>
        <temba-dialog
          id="auto-translate"
          header="Auto Translation"
          ref={(ele: any) => {
            this.autoTranslateDialog = ele;
            if (this.autoTranslateDialog) {
              this.autoTranslateDialog.addEventListener(
                'temba-button-clicked',
                this.handleAutoTranslateButtonClicked
              );
            }
          }}
        >
          <div className="p-6">
            {this.state.translationModel && (
              <div>
                <div className="mb-4">
                  {this.state.translationFilters.categories && (
                    <div>
                      Select an AI model to translate all of the remaining messages and categories
                      into {this.state.languageNames[this.state.language]}. While this a great head
                      start, remember to always review translations provided by AI for accuracy.
                    </div>
                  )}

                  {!this.state.translationFilters.categories && (
                    <div>
                      Select an AI model to translate all of the remaining messages into{' '}
                      {this.state.languageNames[this.state.language]}. While this a great head
                      start, remember to always review translations provided by AI for accuracy.
                    </div>
                  )}
                </div>
                <TembaSelect
                  name="llm"
                  value={this.state.translationModel}
                  endpoint="/api/internal/llms.json"
                  onChange={this.handleLLMChanged}
                  valueKey="uuid"
                ></TembaSelect>
              </div>
            )}

            {!this.state.translationModel && (
              <div>
                This feature requires an AI model to be configured for your workspace to continue.
              </div>
            )}
          </div>
        </temba-dialog>
      </div>
    );
  }
}
