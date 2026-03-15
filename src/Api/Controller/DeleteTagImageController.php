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

        $tagId = (int) Arr::get($request->getQueryParams(), 'tagId');
        $settingKey = 'resofire_blog_cards_tag_image_' . $tagId;

        $path = $this->settings->get($settingKey);

        if ($path && $this->uploadDir->exists($path)) {
            $this->uploadDir->delete($path);
        }

        $this->settings->set($settingKey, null);

        return new JsonResponse(['url' => null]);
    }
}
