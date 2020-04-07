import { react as bindCallbacks } from 'auto-bind';
import classNames from 'classnames/bind';
import React from 'react';
import styles from './TranslatorTab.module.scss';
import i18n from 'config/i18n';
import { PopTab } from 'components/poptab/PopTab';
import { AssetMap, Asset, RenderNodeMap } from 'store/flowContext';
import { PopTabType, Type } from 'config/interfaces';
import { traceUpdate } from 'utils';
import { Action } from 'flowTypes';
import { getTypeConfig } from 'config';
import { needsTranslating, findTranslations, getFriendlyAttribute } from './helpers';
import { getType } from 'config/typeConfigs';
import CheckboxElement from 'components/form/checkbox/CheckboxElement';
import { UpdateTranslationFilters } from 'store/thunks';

const cx: any = classNames.bind(styles);

export interface Translation {
  typeConfig: Type;
  attribute: string;
  from: string;
  to: string;
  node_uuid: string;
  action_uuid?: string;
}

export interface TranslatorTabProps {
  localization: { [uuid: string]: any };
  language: Asset;
  languages: AssetMap;

  translationFilters: { categories: boolean; rules: boolean };

  nodes: RenderNodeMap;
  onToggled: (visible: boolean, tab: PopTabType) => void;
  onTranslationClicked: (translation: Translation) => void;
  onTranslationOpened: (translation: Translation) => void;
  onTranslationFilterChanged: UpdateTranslationFilters;
  popped: string;
}

export interface TranslatorTabState {
  visible: boolean;
  selectedTranslation: Translation;
  translations: Translation[];
  optionsVisible: boolean;
  pctComplete: number;
  translationFilters: { categories: boolean; rules: boolean };
}

export class TranslatorTab extends React.Component<TranslatorTabProps, TranslatorTabState> {
  constructor(props: TranslatorTabProps) {
    super(props);

    this.state = {
      visible: false,
      selectedTranslation: null,
      translations: [],
      optionsVisible: false,
      pctComplete: 0,
      translationFilters: props.translationFilters || { categories: true, rules: true }
    };

    bindCallbacks(this, {
      include: [/^handle/, /^render/, /^toggle/]
    });
  }

  public componentWillUnmount(): void {
    if (this.state.visible) {
      this.handleTabClicked();
    }
  }

  public componentDidUpdate(prevProps: TranslatorTabProps, prevState: TranslatorTabState): void {
    traceUpdate(this, prevProps, prevState);
    if (
      prevProps.translationFilters !== this.props.translationFilters ||
      prevProps.localization !== this.props.localization ||
      (!prevState.visible && this.state.translations.length === 0) ||
      prevState.translationFilters !== this.state.translationFilters
    ) {
      this.handleUpdateTranslations();
    }
  }

  private handleUpdateTranslations(): void {
    let translations: Translation[] = [];
    Object.keys(this.props.nodes).forEach((node_uuid: string) => {
      const renderNode = this.props.nodes[node_uuid];

      // check for router level translations
      if (renderNode.node.router) {
        translations.push(
          ...findTranslations(
            getTypeConfig(getType(renderNode)),
            renderNode.node.router,
            this.props.localization,
            node_uuid
          )
        );
      }

      // find attributes from each action
      renderNode.node.actions.forEach((action: Action) => {
        translations.push(
          ...findTranslations(
            getTypeConfig(action.type),
            action,
            this.props.localization,
            node_uuid,
            action.uuid
          )
        );
      });
    });

    translations = translations.filter((translation: Translation) => {
      if (!this.state.translationFilters.categories && translation.attribute === 'categories') {
        return false;
      }
      if (!this.state.translationFilters.rules && translation.attribute === 'cases') {
        return false;
      }

      return true;
    });

    const complete = translations.filter(
      (translation: Translation) => !needsTranslating(translation)
    ).length;

    const pctComplete = Math.round((complete / translations.length) * 100);

    this.setState({
      pctComplete,
      translations: translations.sort((a: Translation, b: Translation) => {
        if (!a.to) {
          return -1;
        }

        if (!b.to) {
          return 1;
        }

        return 0;
      })
    });
  }

  public handleTabClicked(): void {
    this.props.onToggled(!this.state.visible, PopTabType.ISSUES_TAB);
    this.setState((prevState: TranslatorTabState) => {
      return { visible: !prevState.visible };
    });
  }

  public toggleOptions(): void {
    this.setState({ optionsVisible: !this.state.optionsVisible });
  }

  private toggleCategories(categories: boolean): void {
    this.setState(
      { translationFilters: { categories, rules: this.state.translationFilters.rules } },
      () => {
        this.props.onTranslationFilterChanged(this.state.translationFilters);
      }
    );
  }
  private toggleRules(rules: boolean): void {
    this.setState(
      { translationFilters: { rules, categories: this.state.translationFilters.categories } },
      () => {
        this.props.onTranslationFilterChanged(this.state.translationFilters);
      }
    );
  }

  public render(): JSX.Element {
    const classes = cx({
      [styles.visible]: this.state.visible,
      [styles.hidden]: this.props.popped && this.props.popped !== PopTabType.ISSUES_TAB
    });

    const optionsClasses = cx({
      [styles.options]: true,
      [styles.options_visible]: this.state.optionsVisible
    });

    return (
      <div className={classes}>
        <div className={styles.mask} />
        <PopTab
          header={`${this.props.language.name} ${i18n.t('translation.label', 'Translations')}`}
          label={i18n.t('translation.header', 'Flow Translation')}
          color="#777"
          icon="fe-earth"
          top="243px"
          visible={this.state.visible}
          onShow={this.handleTabClicked}
          onHide={this.handleTabClicked}
        >
          <div className={styles.translations_wrapper}>
            {this.state.translations.map((translation: Translation) => {
              return (
                <div
                  key={
                    'loc-' + translation.node_uuid + translation.action_uuid + translation.attribute
                  }
                  className={styles.translate_block}
                >
                  {needsTranslating(translation) ? (
                    <div className={styles.needs_translation}>
                      <div className={styles.text + ' ' + styles.from_text}>{translation.from}</div>
                      <div className={styles.text + ' ' + styles.attribute}>
                        {translation.typeConfig.name} {getFriendlyAttribute(translation.attribute)}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.translated}>
                      <div className={styles.check}>
                        <span className="fe-check"></span>
                      </div>
                      <div>
                        <div className={styles.text + ' ' + styles.to_text}>{translation.to}</div>
                        <div className={styles.text + ' ' + styles.from_text}>
                          {translation.from}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className={optionsClasses} onClick={this.toggleOptions}>
            <div className={styles.header}>
              <div className={styles.progress_bar}>
                <div
                  style={{ width: `${this.state.pctComplete}%` }}
                  className={styles.filled}
                ></div>
              </div>
              <div className={styles.toggle}>
                <span className="fe-arrow-up"></span>
              </div>
            </div>
            <div className={styles.filters}>
              <div className={styles.checkboxes}>
                <div>
                  <CheckboxElement
                    name="categories"
                    checked={this.state.translationFilters.categories}
                    description={'Categories'}
                    checkboxClassName={styles.checkbox}
                    onChange={this.toggleCategories}
                  />
                </div>
                <div>
                  <CheckboxElement
                    name="rules"
                    checked={this.state.translationFilters.rules}
                    description={'Rule Arguments'}
                    checkboxClassName={styles.checkbox}
                    onChange={this.toggleRules}
                  />
                </div>
              </div>
              <div className={styles.pct_complete}>{this.state.pctComplete}%</div>
            </div>
          </div>
        </PopTab>
      </div>
    );
  }
}
