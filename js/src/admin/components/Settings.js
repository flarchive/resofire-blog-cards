import app from 'flarum/admin/app';
import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import RecalculateModal from './RecalculateModal';
import TagImageUploader from './TagImageUploader';

export default class Settings extends ExtensionPage {
  oninit(vnode) {
    super.oninit(vnode);
    this.tagsLoaded = false;
    this.tags = [];

    app.tagList.load(['parent']).then((tags) => {
      // Show all tags sorted: primary first, then children, then secondary
      this.tags = tags.filter(Boolean).sort((a, b) => {
        const aPos = a.position();
        const bPos = b.position();
        if (aPos === null && bPos === null) return (b.discussionCount() || 0) - (a.discussionCount() || 0);
        if (bPos === null) return -1;
        if (aPos === null) return 1;
        return aPos - bPos;
      });
      this.tagsLoaded = true;
      m.redraw();
    });
  }

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

            <div className="Section" style="margin-top: 1rem;">
              {this.buildSettingComponent({
                type: 'switch',
                setting: 'resofire_blog_cards_fullWidth',
                label: app.translator.trans('resofire_blog_cards.admin.settings.fullWidth_label'),
                help: app.translator.trans('resofire_blog_cards.admin.settings.fullWidth_help'),
              })}
            </div>

            {this.submitButton()}

            <div className="Section" style="margin-top: 2rem;">
              <h3>{app.translator.trans('resofire_blog_cards.admin.tag_images_heading')}</h3>
              <p className="helpText">{app.translator.trans('resofire_blog_cards.admin.tag_images_help')}</p>
              {this.tagsLoaded
                ? <div className="TagImageUploaderList">
                    {this.tags.map((tag) => m(TagImageUploader, { key: tag.id(), tag }))}
                  </div>
                : LoadingIndicator.component({ size: 'small', display: 'inline' })}
            </div>

            <div className="Section" style="margin-top: 2rem;">
              <h3>{app.translator.trans('resofire_blog_cards.admin.tools_heading')}</h3>
              <p className="helpText">{app.translator.trans('resofire_blog_cards.admin.recalculate_help')}</p>
              <div className="Form-group">
                {Button.component({
                  className: 'Button Button--primary',
                  onclick: () => app.modal.show(RecalculateModal),
                }, app.translator.trans('resofire_blog_cards.admin.recalculate_button'))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
}
