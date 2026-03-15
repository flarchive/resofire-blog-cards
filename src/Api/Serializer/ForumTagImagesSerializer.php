<?php

namespace Resofire\BlogCards\Api\Serializer;

use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Contracts\Filesystem\Filesystem;

/**
 * Appends tag image URLs to the forum serializer payload so the JS
 * frontend can read them without additional API requests.
 *
 * Attribute format: resofireBlogCardsTagImage_{tagId} => URL|null
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
        // Find all tag image settings and expose them as forum attributes
        $all = $this->settings->all();

        foreach ($all as $key => $value) {
            if (str_starts_with($key, 'resofire_blog_cards_tag_image_') && $value) {
                $tagId = substr($key, strlen('resofire_blog_cards_tag_image_'));
                $attributes['resofireBlogCardsTagImage_' . $tagId] = $this->uploadDir->url($value);
            }
        }

        return $attributes;
    }
}
