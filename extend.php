<?php

use Flarum\Extend;
use Flarum\Api\Controller\ListDiscussionsController;
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

    (new Extend\ApiController(ListDiscussionsController::class))
        ->addInclude('firstPost')
        ->addInclude('participantPreview')
        ->load(['participantPreview'])
        ->prepareDataForSerialization(function ($controller, $data, $request, $document) {
            // Filter null users from participantPreview to prevent JS store crash
            // when a participant user has been deleted from the database.
            foreach ($data as $discussion) {
                if ($discussion->relationLoaded('participantPreview')) {
                    $discussion->setRelation(
                        'participantPreview',
                        $discussion->participantPreview->filter(fn($user) => $user !== null)
                    );
                }
            }
        }),


    (new Extend\Routes('api'))
        ->get(
            '/resofire/participants/recalculate',
            'resofire.blog-cards.participants.recalculate.get',
            RecalculateParticipantsController::class
        )
        ->post(
            '/resofire/participants/recalculate',
            'resofire.blog-cards.participants.recalculate',
            RecalculateParticipantsController::class
        ),

    (new Extend\Console())
        ->command(PopulateParticipantPreviews::class),

    (new Extend\Event())
        ->subscribe(UpdateParticipantPreview::class),
];
