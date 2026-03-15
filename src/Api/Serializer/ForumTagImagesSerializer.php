<?php

namespace Resofire\BlogCards\Api\Serializer;

use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Contracts\Filesystem\Filesystem;

/**
 * Appends tag image URLs to the forum serializer payload.
 *
 * Reads a single JSON blob from settings — one DB read, one JSON decode.
 * Serializes as a single attribute: resofireBlogCardsTagImages => {tagId: url, ...}
 */
class ForumTagImagesSerializer
{
    protected Filesystem $uploadDir;

    public function __construct(
        protected SettingsRepositoryInterface $settings,
        Factory $filesystemFactory
    ) {
        $this->uploadDir = $filesystemFactory->disk('flarum-assets');
    }

    public function __invoke(ForumSerializer $serializer, $model, array $attributes): array
    {
        $map = json_decode($this->settings->get('resofire_blog_cards_tag_images', '{}'), true) ?: [];

        $urls = [];
        foreach ($map as $tagId => $filename) {
            if ($filename) {
                $urls[(string) $tagId] = $this->uploadDir->url($filename);
            }
        }

        $attributes['resofireBlogCardsTagImages'] = $urls;

        return $attributes;
    }
}
