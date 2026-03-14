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

    if (app.current.matches(IndexPage) && onIndexPage) {
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
    }

    return original();
  });

}, -1);

Object.assign(compat, extCompat);
