import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';

export default class Settings extends ExtensionPage {
  content() {
    return (
      <div className="BlogCardsSettings">
        <div className="container">
          <div className="BlogCardsSettings--content">
            <div className="Section" style="margin-top: 1.5rem;">
              {this.buildSettingComponent({
                type: 'switch',
                setting: 'resofire_blog_cards_onIndexPage',
                label: app.translator.trans('resofire_blog_cards.admin.settings.onIndexPage_label'),
                help: app.translator.trans('resofire_blog_cards.admin.settings.onIndexPage_help'),
              })}
            </div>
            <div className="Section" style="margin-top: 1rem;">
              {this.buildSettingComponent({
                type: 'flarum-tags.select-tags',
                setting: 'resofire_blog_cards_tagIds',
                label: app.translator.trans('resofire_blog_cards.admin.settings.tagIds_label'),
                help: app.translator.trans('resofire_blog_cards.admin.settings.tagIds_help'),
              })}
            </div>
            {this.submitButton()}
          </div>
        </div>
      </div>
    );
  }
}
