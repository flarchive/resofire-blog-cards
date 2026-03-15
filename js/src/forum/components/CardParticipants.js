import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Tooltip from 'flarum/common/components/Tooltip';
import avatar from 'flarum/common/helpers/avatar';
import ParticipantsModal from './ParticipantsModal';

export default class CardParticipants extends Component {
  view() {
    const discussion = this.attrs.discussion;
    const preview = (discussion.participantPreview() || []).filter(Boolean);

    if (!preview.length) return <span />;

    // Same overflow formula as discussion-participants:
    // total participants - 7 (1 OP shown by Flarum + 6 in our strip)
    const total = discussion.attribute('participantCount') != null
      ? discussion.attribute('participantCount')
      : 0;
    const overflowN = Math.max(0, total - 7);

    const avatars = preview.map((user) => {
      const name = user.displayName ? user.displayName() : (user.username ? user.username() : '');
      return (
        <Tooltip text={name} position="bottom">
          <a
            className="CardParticipants-avatar"
            href={app.route('user', { username: user.slug() })}
            onclick={(e) => e.stopPropagation()}
          >
            {avatar(user)}
          </a>
        </Tooltip>
      );
    });

    const overflowBtn = overflowN > 0 ? (
      <button
        className="CardParticipants-overflow Button Button--icon Button--flat"
        type="button"
        title={app.translator.trans('resofire_blog_cards.forum.show_all_participants')}
        onclick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          app.modal.show(ParticipantsModal, { discussion });
        }}
      >
        +{overflowN}
      </button>
    ) : null;

    return (
      <div className="CardParticipants">
        {avatars}
        {overflowBtn}
      </div>
    );
  }
}
