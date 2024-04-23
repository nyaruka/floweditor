import { react as bindCallbacks } from 'auto-bind';
import { ConfigProviderContext } from 'config/ConfigProvider';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Asset, Assets } from 'store/flowContext';
import AppState from 'store/state';
import { DispatchWithState, HandleLanguageChange, handleLanguageChange } from 'store/thunks';

import styles from './LanguageSelector.module.scss';

export interface LanguageSelectorProps {
  language: Asset;
  languages: Assets;
  handleLanguageChange: HandleLanguageChange;
}

export const containerClasses = 'language-selector';

export class LanguageSelector extends React.Component<LanguageSelectorProps> {
  constructor(props: LanguageSelectorProps, context: ConfigProviderContext) {
    super(props, context);
    bindCallbacks(this, {
      include: [/^handle/]
    });
  }

  public handleLanguageChanged(language: Asset): void {
    this.props.handleLanguageChange(language);
  }

  public handleLanguageSort(a: Asset, b: Asset): number {
    if (a.id === 'base') {
      return -1;
    }

    if (b.id === 'base') {
      return 1;
    }

    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }

    return a.name.localeCompare(b.name);
  }

  public render(): JSX.Element {
    if (!this.props.language) {
      return null;
    }

    const languages = Object.keys(this.props.languages.items)
      .map((iso: string) => this.props.languages.items[iso])
      .sort(this.handleLanguageSort);

    if (languages.length === 1) {
      return null;
    }

    return (
      <div className={containerClasses}>
        <div className={styles.Languages}>
          {languages.map((lang: Asset, idx: number) => {
            return (
              <div key={'lang_' + lang.id} className={styles.language}>
                {idx > 0 ? <div className={styles.separator}>|</div> : null}
                <div
                  className={
                    styles.language_link +
                    ' ' +
                    (this.props.language.id === lang.id ? styles.active : '')
                  }
                  onClick={() => {
                    this.handleLanguageChanged(lang);
                  }}
                >
                  {lang.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = ({ flowContext: { assetStore }, editorState: { language } }: AppState) => ({
  languages: assetStore.languages,
  language
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
  bindActionCreators(
    {
      handleLanguageChange
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LanguageSelector);
