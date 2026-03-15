import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';

/**
 * Renders an upload/remove button for a single tag's default card image.
 * Mirrors Flarum's UploadImageButton pattern exactly.
 */
export default class TagImageUploader extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = false;
    // Current URL comes from forum attributes serialized by ForumTagImagesSerializer
    this.currentUrl = app.forum.attribute('resofireBlogCardsTagImage_' + this.attrs.tag.id()) || null;
  }

  view() {
    const tag = this.attrs.tag;

    return (
      <div className="TagImageUploader">
        <div className="TagImageUploader-label">
          <span className="TagImageUploader-dot" style={{ background: tag.color() || 'var(--muted-color)' }} />
          <strong>{tag.name()}</strong>
        </div>

        {this.currentUrl ? (
          <div className="TagImageUploader-preview">
            <img src={this.currentUrl} alt={tag.name()} />
            <div className="TagImageUploader-actions">
              {Button.component({
                className: 'Button Button--danger Button--flat',
                loading: this.loading,
                onclick: () => this.remove(),
              }, [app.icon('fas fa-trash'), ' Remove'])}
            </div>
          </div>
        ) : (
          <div className="TagImageUploader-empty">
            {Button.component({
              className: 'Button',
              loading: this.loading,
              onclick: () => this.upload(),
            }, [app.icon('fas fa-upload'), ' Upload Image'])}
          </div>
        )}
      </div>
    );
  }

  upload() {
    if (this.loading) return;

    const $input = $('<input type="file" accept="image/*">');

    $input.appendTo('body').hide().trigger('click').on('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const body = new FormData();
      body.append('tagImage', file);

      this.loading = true;
      m.redraw();

      app.request({
        method: 'POST',
        url: app.forum.attribute('apiUrl') + '/resofire/blog-cards/tag-image',
        params: { tagId: this.attrs.tag.id() },
        serialize: (raw) => raw,
        body,
      }).then((r) => {
        this.currentUrl = r.url;
        // Update the forum attribute so other components see it immediately
        app.forum.pushData({ attributes: { ['resofireBlogCardsTagImage_' + this.attrs.tag.id()]: r.url } });
        this.loading = false;
        m.redraw();
      }).catch(() => {
        this.loading = false;
        m.redraw();
      });
    });
  }

  remove() {
    if (this.loading) return;

    this.loading = true;
    m.redraw();

    app.request({
      method: 'DELETE',
      url: app.forum.attribute('apiUrl') + '/resofire/blog-cards/tag-image',
      params: { tagId: this.attrs.tag.id() },
    }).then(() => {
      this.currentUrl = null;
      app.forum.pushData({ attributes: { ['resofireBlogCardsTagImage_' + this.attrs.tag.id()]: null } });
      this.loading = false;
      m.redraw();
    }).catch(() => {
      this.loading = false;
      m.redraw();
    });
  }
}
