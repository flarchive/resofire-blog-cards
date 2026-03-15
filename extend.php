<?php

use Flarum\Extend;
use Flarum\Api\Controller\ListDiscussionsController;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),

    (new Extend\Locales(__DIR__ . '/locale')),

    (new Extend\Settings())
        ->serializeToForum('resofireBlogCardsOnIndexPage', 'resofire_blog_cards_onIndexPage')
        ->default('resofire_blog_cards_onIndexPage', 0)
        ->serializeToForum('resofireBlogCardsTagIds', 'resofire_blog_cards_tagIds')
        ->default('resofire_blog_cards_tagIds', '[]'),

    (new Extend\ApiController(ListDiscussionsController::class))
        ->addInclude('firstPost'),
];
