<?php

namespace Resofire\BlogCards\Api\Controller;

use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Arr;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class DeleteTagImageController implements RequestHandlerInterface
{
    protected Filesystem $uploadDir;

    public function __construct(
        protected SettingsRepositoryInterface $settings,
        Factory $filesystemFactory
    ) {
        $this->uploadDir = $filesystemFactory->disk('flarum-assets');
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        RequestUtil::getActor($request)->assertAdmin();

        $tagId = (string) Arr::get($request->getQueryParams(), 'tagId');

        $map = json_decode($this->settings->get('resofire_blog_cards_tag_images', '{}'), true) ?: [];

        if (!empty($map[$tagId]) && $this->uploadDir->exists($map[$tagId])) {
            $this->uploadDir->delete($map[$tagId]);
        }

        unset($map[$tagId]);
        $this->settings->set('resofire_blog_cards_tag_images', json_encode($map));

        return new JsonResponse(['url' => null]);
    }
}
