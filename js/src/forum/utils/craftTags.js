import Link from 'flarum/common/components/Link';
import textContrastClass from 'flarum/common/helpers/textContrastClass';
// Flarum 2.x: cross-extension imports require the 'ext:' prefix.
// 'flarum/tags/utils/sortTags' (1.x) → 'ext:flarum/tags/utils/sortTags' (2.x).
// Without this prefix, flarum-webpack-config 3.x will not resolve the import.
import sortTags from 'ext:flarum/tags/utils/sortTags';

export default function craftTags(tags) {
  if (tags) {
    return [sortTags(tags).map(function (tag) {
      const color = tag.color();
      return [
        <Link className={'cardTag' + (color ? ' cardTag--colored ' + textContrastClass(color) : '')}
              style={color ? {'--tag-bg': color} : {}}
              href={app.route('tag', {tags: tag.slug()})}>
          {tag.name()}
        </Link>
      ];
    })];
  }
}
