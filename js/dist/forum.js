(()=>{var t={n:o=>{var s=o&&o.__esModule?()=>o.default:()=>o;return t.d(s,{a:s}),s},d:(o,s)=>{for(var n in s)t.o(s,n)&&!t.o(o,n)&&Object.defineProperty(o,n,{enumerable:!0,get:s[n]})},o:(t,o)=>Object.prototype.hasOwnProperty.call(t,o),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},o={};(()=>{"use strict";t.r(o);

// ---------------------------------------------------------------------------
// Imports — flarum.reg.get() directly, no t.n() wrapping.
// DiscussionList, DiscussionListState, ReplyComposer are chunk modules —
// reference via string path only (extend/override string-form uses onLoad).
// ---------------------------------------------------------------------------
const app              = flarum.reg.get("core","forum/app");
const extenders        = flarum.reg.get("core","common/extenders");
const { extend, override } = flarum.reg.get("core","common/extend");
const Discussion       = flarum.reg.get("core","common/models/Discussion");
const Component        = flarum.reg.get("core","common/Component");
const Modal            = flarum.reg.get("core","common/components/Modal");
const Button           = flarum.reg.get("core","common/components/Button");
const LoadingIndicator = flarum.reg.get("core","common/components/LoadingIndicator");
const Tooltip          = flarum.reg.get("core","common/components/Tooltip");
const Avatar           = flarum.reg.get("core","common/components/Avatar");
const Icon             = flarum.reg.get("core","common/components/Icon");
const Link             = flarum.reg.get("core","common/components/Link");
const Dropdown         = flarum.reg.get("core","common/components/Dropdown");
const Placeholder      = flarum.reg.get("core","common/components/Placeholder");
const username         = flarum.reg.get("core","common/helpers/username");
const humanTime        = flarum.reg.get("core","common/utils/humanTime");
const abbreviateNumber = flarum.reg.get("core","common/utils/abbreviateNumber");
const stringUtils      = flarum.reg.get("core","common/utils/string");
const truncate         = stringUtils ? stringUtils.truncate : (s,n)=>s&&s.length>n?s.slice(0,n)+"...":s;
const IndexPage        = flarum.reg.get("core","forum/components/IndexPage");
const DiscussionControls = flarum.reg.get("core","forum/utils/DiscussionControls");
const textContrastClass = flarum.reg.get("core","common/helpers/textContrastClass");
// sortTags from flarum-tags extension
const sortTags         = flarum.reg.get("flarum-tags","common/utils/sortTags");

// ---------------------------------------------------------------------------
// Model extender
// ---------------------------------------------------------------------------
const _extend = [(new extenders.Model(Discussion)).hasMany("participantPreview")];
t.d(o, {extend: () => _extend});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getFirstPostImage(discussion) {
  if (!("_cardImageCache" in discussion)) {
    discussion._cardImageCache = null;
    try {
      const firstPost = discussion.firstPost();
      if (firstPost) {
        const html = firstPost.contentHtml() || "";
        const doc = new DOMParser().parseFromString(html, "text/html");
        const img = doc.querySelector("img");
        discussion._cardImageCache = (img && img.src) ? img.src : null;
      }
    } catch(e) {}
  }
  return discussion._cardImageCache;
}

function craftBadges(badges) {
  if (!badges || !badges.length) return null;
  return m(".cardBadges", badges.map(badge =>
    m(Tooltip, {text: badge.attrs.label ? badge.attrs.label[0] : "", position: "right"},
      m("span.cardBadge.Badge.Badge--"+(badge.attrs.type||""), [m(Icon, {name: badge.attrs.icon||""})]))
  ));
}

function craftTags(tags) {
  if (!tags) return null;
  const sorted = sortTags ? sortTags(tags) : tags;
  return sorted.map(tag => {
    const color = tag.color();
    return m(Link, {
      className: "cardTag" + (color ? " cardTag--colored " + (textContrastClass ? textContrastClass(color) : "") : ""),
      style: color ? {"--tag-bg": color} : {},
      href: app.route("tag", {tags: tag.slug()})
    }, tag.name());
  });
}

function checkOverflowingTags() {
  const cardListItemsOnPrimary = document.querySelectorAll(".CardsListItem.Card .cardLink");
  const cardListItems = document.querySelectorAll(".cardGrid .colSpan-2");
  function toggleOverflow(cardTags, cardListItem) {
    if (!cardTags) return;
    if (cardTags.scrollWidth > cardListItem.clientWidth - 30) {
      cardTags.classList.add("overflowing");
    } else {
      cardTags.classList.remove("overflowing");
    }
  }
  cardListItemsOnPrimary.forEach(item => toggleOverflow(item.querySelector(".cardTags"), item));
  cardListItems.forEach(item => toggleOverflow(item.querySelector(".flexBox .cardTags"), item));
}

// ---------------------------------------------------------------------------
// ParticipantsModal
// ---------------------------------------------------------------------------
const PAGE_SIZE = 10;

class ParticipantsModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this._discussionId = vnode.attrs.discussion.id();
    this.participants  = [];
    this.page          = 0;
    this.total         = null;
    this.loading       = false;
    this.loadPage();
  }

  onbeforeupdate(vnode) {
    const newId = vnode.attrs.discussion.id();
    if (newId !== this._discussionId) {
      this._discussionId = newId;
      this.participants  = [];
      this.page          = 0;
      this.total         = null;
      this.loading       = false;
      this.loadPage();
    }
  }

  className() { return "ParticipantsModal Modal--small"; }

  title() {
    const c = this.total !== null ? this.total : (this.attrs.discussion.attribute("participantCount") || "");
    return app.translator.trans("resofire_blog_cards.forum.modal_title", {count: c});
  }

  content() {
    if (this.participants.length === 0 && this.loading) {
      return m("div", {className:"Modal-body"}, m(LoadingIndicator));
    }

    const hasPrev = this.page > 0;
    const hasNext = this.total === null || ((this.page + 1) * PAGE_SIZE) < this.total;
    const totalPages = this.total !== null ? Math.ceil(this.total / PAGE_SIZE) : null;

    const items = this.participants.map(u => {
      const displayName = u.displayName ? u.displayName() : (u.username ? u.username() : "");
      const slug = u.slug ? u.slug() : (displayName || "");
      return m("li", {className:"ParticipantsModal-item"},
        m("a", {href: app.route("user", {username: slug}), onclick: () => app.modal.close()},
          m(Avatar, {user: u}),
          m("span", {className:"ParticipantsModal-username"}, displayName)
        )
      );
    });

    const pagination = (hasPrev || hasNext)
      ? m("div", {className:"ParticipantsModal-pagination"},
          m(Button, {
            className:"Button", disabled: !hasPrev || this.loading,
            onclick: () => { this.page--; this.loadPage(); }
          }, "\u2190 Prev"),
          m("span", {className:"ParticipantsModal-pageInfo"},
            (this.page+1) + (totalPages !== null ? " / "+totalPages : "")),
          m(Button, {
            className:"Button Button--primary", disabled: !hasNext || this.loading,
            onclick: () => { this.page++; this.loadPage(); }
          }, "Next \u2192")
        )
      : null;

    return m("div", {className:"Modal-body"},
      this.loading ? m(LoadingIndicator) : null,
      m("ul", {className:"ParticipantsModal-list"}, items),
      pagination
    );
  }

  loadPage() {
    if (this.loading) return;
    this.loading = true;
    m.redraw();
    app.request({
      method: "GET",
      url: app.forum.attribute("apiUrl") + "/discussions/" + this.attrs.discussion.id() + "/participants",
      params: {"page[offset]": this.page * PAGE_SIZE, "page[limit]": PAGE_SIZE},
    }).then(r => {
      const remapped = {
        data: (r.data || []).map(i => ({
          type: "users",
          id: i.attributes.userId != null ? String(i.attributes.userId) : i.id,
          attributes: {
            username:    i.attributes.username,
            slug:        i.attributes.slug,
            avatarUrl:   i.attributes.avatarUrl,
            displayName: i.attributes.displayName,
            color:       i.attributes.color,
          },
        })),
      };
      app.store.pushPayload(remapped);
      this.participants = (r.data || []).map(i => {
        const uid = i.attributes.userId != null ? i.attributes.userId : i.id;
        return app.store.getById("users", String(uid));
      }).filter(Boolean);
      this.total   = (r.meta && r.meta.total != null) ? r.meta.total : null;
      this.loading = false;
      m.redraw();
    }).catch(() => { this.loading = false; m.redraw(); });
  }
}

// ---------------------------------------------------------------------------
// CardParticipants
// ---------------------------------------------------------------------------
class CardParticipants extends Component {
  view() {
    const discussion = this.attrs.discussion;
    let preview = [];
    try {
      const result = discussion.participantPreview ? discussion.participantPreview() : false;
      preview = (result || []).filter(Boolean);
    } catch(e) { return m("["); }
    if (!preview.length) return m("[");

    const total = discussion.attribute("participantCount") != null
      ? discussion.attribute("participantCount") : 0;
    const overflowN = Math.max(0, total - 7);

    const avatars = preview.map(user => {
      const name = user.displayName ? user.displayName() : (user.username ? user.username() : "");
      return m(Tooltip, {text: name, position: "bottom"},
        m("a", {
          className: "CardParticipants-avatar",
          href: app.route("user", {username: user.slug()}),
          onclick: e => e.stopPropagation()
        }, m(Avatar, {user}))
      );
    });

    const overflowBtn = overflowN > 0
      ? m("button", {
          className: "CardParticipants-overflow Button Button--icon Button--flat",
          type: "button",
          title: app.translator.trans("resofire_blog_cards.forum.show_all_participants"),
          onclick: e => {
            e.stopPropagation();
            e.preventDefault();
            app.modal.show(ParticipantsModal, {discussion});
          }
        }, "+"+overflowN)
      : null;

    return m("div", {className:"CardParticipants"}, avatars, overflowBtn);
  }
}

// ---------------------------------------------------------------------------
// CardItem
// ---------------------------------------------------------------------------
class CardItem extends Component {
  oninit(vnode) {
    super.oninit(vnode);
    this.discussion = this.attrs.discussion;
  }

  view() {
    const discussion  = this.discussion;
    const jumpTo      = Math.min(discussion.lastPostNumber() || 0, (discussion.lastReadPostNumber() || 0) + 1);
    const unreadCount = discussion.unreadCount();
    const replyCount  = discussion.replyCount() || 0;
    const displayCount= unreadCount || replyCount;
    const imageUrl    = getFirstPostImage(discussion);

    let excerpt = "";
    try {
      const firstPost = discussion.firstPost();
      if (firstPost) {
        const html = firstPost.contentHtml() || "";
        const doc  = new DOMParser().parseFromString(html, "text/html");
        excerpt    = truncate((doc.body.textContent || "").trim().replace(/\s+/g, " "), 260);
      }
    } catch(e) {}

    return m("div", {
      key: discussion.id(),
      "data-id": discussion.id(),
      className: "CardsListItem Card"
        + (discussion.isHidden() ? " Hidden" : "")
        + (discussion.isUnread() ? " unread" : "")
        + (discussion.isRead()   ? " read"   : ""),
    },
      DiscussionControls.controls(discussion, this).toArray().length
        ? m(Dropdown, {
            icon: "fas fa-ellipsis-v",
            className: "DiscussionListItem-controls",
            buttonClassName: "Button Button--icon Button--flat Slidable-underneath Slidable-underneath--right",
          }, DiscussionControls.controls(discussion, this).toArray())
        : "",

      m(Link, {href: app.route.discussion(discussion, jumpTo), className: "cardLink"},
        m("div", {className:"cardImageWrap"},
          imageUrl
            ? m("div", {className:"cardImage", style:"background-image:url("+imageUrl+")", "aria-hidden":"true"})
            : m("div", {className:"cardImage cardImage--placeholder", "aria-hidden":"true"})
        ),
        m("div", {className:"cardBody"},
          craftBadges(discussion.badges().toArray()),
          m("div", {className:"cardTags"}, craftTags(discussion.tags())),
          m("h2", {className:"cardTitle", title:discussion.title()},
            truncate(discussion.title(), 80)),
          excerpt ? m("p", {className:"cardExcerpt"}, excerpt) : ""
        ),
        m("div", {className:"cardFooter"},
          m("span", {className:"cardAuthor"},
            m(Avatar, {user: discussion.user(), className:"cardAvatar"}),
            username(discussion.user())
          ),
          m("span", {className:"cardReplies"},
            m(Icon, {name:"fas fa-comment-alt", className:"cardRepliesIcon"}),
            m("strong", {className:"cardRepliesCount"}, displayCount)
          )
        ),
        this.attrs.showParticipants !== false
          ? m("div", {className:"cardParticipantsRow"}, m(CardParticipants, {discussion}))
          : null
      )
    );
  }
}

// ---------------------------------------------------------------------------
// Initializer
// ---------------------------------------------------------------------------
app.initializers.add("resofire-blog-cards", () => {

  let cachedSettings = null;
  function getSettings() {
    if (!cachedSettings) {
      cachedSettings = {
        onIndexPage:     Number(app.forum.attribute("resofireBlogCardsOnIndexPage")) === 1,
        configuredTagIds:JSON.parse(app.forum.attribute("resofireBlogCardsTagIds") || "[]"),
        fullWidth:       Number(app.forum.attribute("resofireBlogCardsFullWidth")) === 1,
        showParticipants:Number(app.forum.attribute("resofireBlogCardsShowParticipants") ?? 1) !== 0,
      };
    }
    return cachedSettings;
  }

  // DiscussionList, DiscussionListState, ReplyComposer are chunk modules —
  // use string-path form so extend/override defers via flarum.reg.onLoad.
  extend("flarum/forum/components/DiscussionList", "oncreate", checkOverflowingTags);
  extend("flarum/forum/components/DiscussionList", "onupdate", checkOverflowingTags);

  extend("flarum/forum/states/DiscussionListState", "requestParams", function(params) {
    if (!params.include.includes("participantPreview")) {
      params.include.push("participantPreview");
    }
  });

  override("flarum/forum/components/DiscussionList", "view", function(original) {
    const {onIndexPage, configuredTagIds, fullWidth, showParticipants} = getSettings();
    const isIndex = app.current.matches(IndexPage);
    const state   = this.attrs.state;

    let loading;
    if (state.isInitialLoading() || state.isLoadingNext()) {
      loading = m(LoadingIndicator);
    } else if (state.hasNext()) {
      loading = m(Button, {className:"Button", onclick: state.loadNext.bind(state)},
        app.translator.trans("core.forum.discussion_list.load_more_button"));
    }

    if (state.isEmpty()) {
      return m("div", {className:"DiscussionList"},
        m(Placeholder, {text: app.translator.trans("core.forum.discussion_list.empty_text")}));
    }

    const isTagPage       = isIndex && !!m.route.param("tags");
    const isMainIndex     = isIndex && !m.route.param("tags");
    const isDiscussionPage= !isIndex;

    if (isMainIndex && !onIndexPage) return original();

    if (isDiscussionPage) {
      const discussionTagSlug = state.params && state.params.tags;
      if (!discussionTagSlug) return original();
      if (configuredTagIds.length > 0) {
        const currentTag = app.store.all("tags").find(
          t => t.slug().localeCompare(discussionTagSlug, undefined, {sensitivity:"base"}) === 0);
        if (!currentTag || !configuredTagIds.includes(currentTag.id())) return original();
      }
    }

    if (configuredTagIds.length > 0 && isTagPage) {
      const currentSlug = m.route.param("tags");
      const currentTag  = app.store.all("tags").find(
        t => t.slug().localeCompare(currentSlug, undefined, {sensitivity:"base"}) === 0);
      if (!currentTag || !configuredTagIds.includes(currentTag.id())) return original();
    }

    const pageSize = state.pageSize || 20;
    return m("div", {
      className: "DiscussionList" + (state.isSearchResults() ? " DiscussionList--searchResults" : "")
    },
      m("ul", {
        role: "feed",
        "aria-busy": false,
        className: "DiscussionList-discussions flexCard" + (fullWidth ? " flexCard--full" : ""),
      },
        state.getPages().map((pg, pageNum) =>
          pg.items.map((discussion, itemNum) =>
            m("li", {
              key: discussion.id(),
              "data-id": discussion.id(),
              role: "article",
              "aria-setsize": "-1",
              "aria-posinset": pageNum * pageSize + itemNum + 1,
            }, m(CardItem, {discussion, showParticipants}))
          )
        )
      ),
      m("div", {className:"DiscussionList-loadMore"}, loading)
    );
  });

  override("flarum/forum/components/ReplyComposer", "onsubmit", function(original) {
    const discussion   = this.attrs.discussion;
    const discussionId = String(discussion.id());
    const currentUser  = app.session.user;
    if (!currentUser) { original(); return; }
    const currentUserId = String(currentUser.id());
    const originalCreateRecord = app.store.createRecord.bind(app.store);

    app.store.createRecord = function(type, data) {
      app.store.createRecord = originalCreateRecord;
      const record = originalCreateRecord(type, data);
      if (type === "posts") {
        const originalSave = record.save.bind(record);
        record.save = function(saveData) {
          return originalSave(saveData).then(function(post) {
            const disc = app.store.getById("discussions", discussionId);
            if (!disc) return post;
            const preview = (disc.participantPreview() || []).filter(Boolean);
            if (preview.length >= 6) return post;
            const alreadyIn = preview.some(u => String(u.id()) === currentUserId);
            if (alreadyIn) return post;
            const rel = disc.data.relationships = disc.data.relationships || {};
            rel.participantPreview = rel.participantPreview || {data:[]};
            if (!Array.isArray(rel.participantPreview.data)) rel.participantPreview.data = [];
            rel.participantPreview.data.push({type:"users", id:currentUserId});
            disc.freshness = new Date();
            m.redraw();
            return post;
          });
        };
      }
      return record;
    };
    original();
  });

}, -1);

})(),module.exports=o})();
