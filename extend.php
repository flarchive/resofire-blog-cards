<?php

use Flarum\Extend;
use Flarum\Api\Controller\ListDiscussionsController;
use Resofire\BlogCards\Api\Controller\ListDiscussionParticipantsController;
use Resofire\BlogCards\Api\Controller\UploadTagImageController;
use Resofire\BlogCards\Api\Controller\DeleteTagImageController;
use Resofire\BlogCards\Api\Serializer\ForumTagImagesSerializer;
use Resofire\BlogCards\Api\Controller\RecalculateParticipantsController;
use Resofire\BlogCards\Console\PopulateParticipantPreviews;
use Resofire\BlogCards\Listener\UpdateParticipantPreview;

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
        ->default('resofire_blog_cards_tagIds', '[]')
        ->serializeToForum('resofireBlogCardsFullWidth', 'resofire_blog_cards_fullWidth')
        ->default('resofire_blog_cards_fullWidth', 0),

    // Participant preview: include firstPost and participantPreview on list
    (new Extend\ApiController(ListDiscussionsController::class))
        ->addInclude('firstPost')
        ->addInclude('participantPreview')
        ->load(['participantPreview']),

    // Participant preview relationship on Discussion model
    (new Extend\Model(\Flarum\Discussion\Discussion::class))
        ->relationship('participantPreview', function (\Flarum\Discussion\Discussion $discussion) {
            return $discussion
                ->belongsToMany(
                    \Flarum\User\User::class,
                    'discussion_participant_previews',
                    'discussion_id',
                    'user_id'
                )
                ->withPivot('sort_order')
                ->orderBy('discussion_participant_previews.sort_order');
        }),

    (new Extend\ApiSerializer(\Flarum\Api\Serializer\DiscussionSerializer::class))
        ->hasMany('participantPreview', \Flarum\Api\Serializer\UserSerializer::class),

    // API routes for participants
    (new Extend\Routes('api'))
        ->get(
            '/discussions/{id}/participants',
            'resofire.discussions.participants',
            ListDiscussionParticipantsController::class
        )
        ->get(
            '/resofire/participants/recalculate',
            'resofire.participants.recalculate.get',
            RecalculateParticipantsController::class
        )
        ->post(
            '/resofire/participants/recalculate',
            'resofire.participants.recalculate',
            RecalculateParticipantsController::class
        ),

    // Tag image upload/delete routes
    (new Extend\Routes('api'))
        ->post(
            '/resofire/blog-cards/tag-image',
            'resofire.blog-cards.tag-image.upload',
            UploadTagImageController::class
        )
        ->delete(
            '/resofire/blog-cards/tag-image',
            'resofire.blog-cards.tag-image.delete',
            DeleteTagImageController::class
        ),

    // Serialize tag image URLs into the forum payload
    (new Extend\ApiSerializer(\Flarum\Api\Serializer\ForumSerializer::class))
        ->attributes(ForumTagImagesSerializer::class),

    // Console command for backfill
    (new Extend\Console())
        ->command(PopulateParticipantPreviews::class),

    // Event listener to keep preview table in sync
    (new Extend\Event())
        ->subscribe(UpdateParticipantPreview::class),
];
