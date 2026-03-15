<?php

namespace Resofire\BlogCards\Api;

use Flarum\Api\Controller\ListDiscussionsController;
use Flarum\Api\Controller\ShowDiscussionController;
use Flarum\Http\RequestUtil;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class IncludeFirstPost
{
    public function __invoke(ListDiscussionsController $controller, array &$data, ServerRequestInterface $request, Document $document): void
    {
        $data[] = 'firstPost';
    }
}
