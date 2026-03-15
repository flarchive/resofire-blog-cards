import app from 'flarum/admin/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';

/**
 * Renders an upload/remove button for a single tag's default card image.
 * Mirrors Flarum's UploadImageButton pattern exactly.
 */
export default class TagImageUploader extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.loading = false;
  }

  view() {
    const tag = this.attrs.tag;
    if (!tag || !tag.id || !tag.id()) return <div />;
    const tagId = tag.id();
    // Always read fresh from forum attributes so updates are reflected immediately
    const currentUrl = app.forum.attribute('resofireBlogCardsTagImage_' + tagId) || null;

    return (
      <div className="TagImageUploader">
        <div className="TagImageUploader-label">
          <span className="TagImageUploader-dot" style={{ background: tag.color() || 'var(--muted-color)' }} />
          <strong>{tag.name()}</strong>
        </div>

        {currentUrl ? (
          <div className="TagImageUploader-preview">
            <img src={currentUrl} alt={tag.name()} />
            <div className="TagImageUploader-actions">
              {Button.component({
                className: 'Button Button--danger Button--flat',
                loading: this.loading,
                onclick: () => this.remove(tagId),
              }, [app.icon('fas fa-trash'), ' Remove'])}
            </div>
          </div>
        ) : (
          <div className="TagImageUploader-empty">
            {Button.component({
              className: 'Button',
              loading: this.loading,
              onclick: () => this.upload(tagId),
            }, [app.icon('fas fa-upload'), ' Upload Image'])}
          </div>
        )}
      </div>
    );
  }

  upload(tagId) {
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
        params: { tagId },
        serialize: (raw) => raw,
        body,
      }).then((r) => {
        app.forum.pushData({ attributes: { ['resofireBlogCardsTagImage_' + tagId]: r.url } });
        this.loading = false;
        m.redraw();
      }).catch(() => {
        this.loading = false;
        m.redraw();
      });
    });
  }

  remove(tagId) {
    if (this.loading) return;

    this.loading = true;
    m.redraw();

    app.request({
      method: 'DELETE',
      url: app.forum.attribute('apiUrl') + '/resofire/blog-cards/tag-image',
      params: { tagId },
    }).then(() => {
      app.forum.pushData({ attributes: { ['resofireBlogCardsTagImage_' + tagId]: null } });
      this.loading = false;
      m.redraw();
    }).catch(() => {
      this.loading = false;
      m.redraw();
    });
  }
}
