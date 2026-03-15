import Component from 'flarum/common/Component';
import craftBadges from '../utils/craftBadges';
import craftTags from '../utils/craftTags';
import humanTime from 'flarum/common/utils/humanTime';
import icon from 'flarum/common/helpers/icon';
import username from 'flarum/common/helpers/username';
import Dropdown from 'flarum/common/components/Dropdown';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import Link from 'flarum/common/components/Link';
import { truncate } from 'flarum/common/utils/string';
import getFirstPostImage from '../utils/getFirstPostImage';

export default class CardItem extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.discussion = this.attrs.discussion;
  }

  view() {
    const discussion = this.discussion;

    const jumpTo = Math.min(
      discussion.lastPostNumber() ?? 0,
      (discussion.lastReadPostNumber() || 0) + 1
    );

    const unreadCount = discussion.unreadCount();
    const replyCount = discussion.replyCount() || 0;

    const replyText = unreadCount
      ? app.translator.trans('resofire_blog_cards.forum.unreadReplies', { count: unreadCount })
      : app.translator.trans('resofire_blog_cards.forum.replies', { count: replyCount });

    const imageUrl = getFirstPostImage(discussion);

    return (
      <div
        key={discussion.id()}
        data-id={discussion.id()}
        className={'BlogCardsItem Card' + (discussion.isHidden() ? ' Hidden' : '')}
      >
        {DiscussionControls.controls(discussion, this).toArray().length
          ? m(
              Dropdown,
              {
                icon: 'fas fa-ellipsis-v',
                className: 'DiscussionListItem-controls',
                buttonClassName: 'Button Button--icon Button--flat Slidable-underneath Slidable-underneath--right',
              },
              DiscussionControls.controls(discussion, this).toArray()
            )
          : ''}

        <Link href={app.route.discussion(discussion, jumpTo)} className="cardLink">
          {imageUrl
            ? <div className="cardImage" style={{ backgroundImage: `url(${imageUrl})` }} aria-hidden="true" />
            : <div className="cardImage cardImage--placeholder" aria-hidden="true" />}

          {craftBadges(discussion.badges().toArray())}

          <div className="cardTags">{craftTags(discussion.tags())}</div>

          <div className="cardTitle">
            <h2 title={discussion.title()} className="title">
              {truncate(discussion.title(), 80)}
            </h2>
          </div>

          <div className="cardMeta">
            <span className="cardAuthor">{username(discussion.user())}</span>
            <span className="cardDate">{humanTime(discussion.createdAt())}</span>
            <span className="cardReplies">
              {icon('fas fa-comment', { className: 'labelIcon' })}
              {replyText}
            </span>
          </div>
        </Link>
      </div>
    );
  }
}
