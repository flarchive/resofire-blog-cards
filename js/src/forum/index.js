import app from 'flarum/forum/app';
import { extend, override } from 'flarum/extend';
import DiscussionList from 'flarum/forum/components/DiscussionList';
import IndexPage from 'flarum/forum/components/IndexPage';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Placeholder from 'flarum/common/components/Placeholder';
import Button from 'flarum/common/components/Button';
import CardItem from './components/CardItem';
import checkOverflowingTags from './helpers/checkOverflowingTags';
import extCompat from './compat';
import { compat } from '@flarum/core/forum';

app.initializers.add('resofire/blog-cards', () => {

  extend(DiscussionList.prototype, 'oncreate', checkOverflowingTags);
  extend(DiscussionList.prototype, 'onupdate', checkOverflowingTags);

  override(DiscussionList.prototype, 'view', function (original) {
    const onIndexPage = Number(app.forum.attribute('resofireBlogCardsOnIndexPage')) === 1;
    const isIndex = app.current.matches(IndexPage);
    const state = this.attrs.state;
    let loading;

    if (state.isInitialLoading() || state.isLoadingNext()) {
      loading = <LoadingIndicator />;
    } else if (state.hasNext()) {
      loading = Button.component(
        {
          className: 'Button',
          onclick: state.loadNext.bind(state),
        },
        app.translator.trans('core.forum.discussion_list.load_more_button')
      );
    }

    if (state.isEmpty()) {
      const text = app.translator.trans('core.forum.discussion_list.empty_text');
      return <div className="DiscussionList">{m(Placeholder, { text })}</div>;
    }

    // Determine if cards should show based on page and tag filter settings
    const isTagPage = isIndex && !!m.route.param('tags');
    const isMainIndex = isIndex && !m.route.param('tags');

    // If on main index, respect the toggle
    if (isMainIndex && !onIndexPage) return original();

    // If a tag filter is configured, only show cards on matching tag pages
    const configuredTagIds = JSON.parse(app.forum.attribute('resofireBlogCardsTagIds') || '[]');
    if (configuredTagIds.length > 0 && isTagPage) {
      const currentSlug = m.route.param('tags');
      const currentTag = app.store.all('tags').find(
        (t) => t.slug().localeCompare(currentSlug, undefined, { sensitivity: 'base' }) === 0
      );
      if (!currentTag || !configuredTagIds.includes(currentTag.id())) {
        return original();
      }
    }

    return (
      <div className={'DiscussionList' + (state.isSearchResults() ? ' DiscussionList--searchResults' : '')}>
        <div className="DiscussionList-discussions flexCard">
          {state.getPages().map((pg) => {
            return pg.items.map((discussion) => {
              return m(CardItem, { discussion });
            });
          })}
        </div>
        <div className="DiscussionList-loadMore">{loading}</div>
      </div>
    );
  });

}, -1);

Object.assign(compat, extCompat);
