<?php

namespace Resofire\BlogCards\Api\Controller;

use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Filesystem\Factory;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class UploadTagImageController implements RequestHandlerInterface
{
    protected Filesystem $uploadDir;

    public function __construct(
        protected SettingsRepositoryInterface $settings,
        protected ImageManager $imageManager,
        Factory $filesystemFactory
    ) {
        $this->uploadDir = $filesystemFactory->disk('flarum-assets');
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        RequestUtil::getActor($request)->assertAdmin();

        $tagId = (int) Arr::get($request->getQueryParams(), 'tagId');

        $file = Arr::get($request->getUploadedFiles(), 'tagImage');

        $image = $this->imageManager
            ->make($file->getStream()->getMetadata('uri'))
            ->widen(1200, function ($constraint) {
                $constraint->upsize();
            })
            ->encode('jpg', 85);

        $settingKey = 'resofire_blog_cards_tag_image_' . $tagId;

        // Delete old file if exists
        $oldPath = $this->settings->get($settingKey);
        if ($oldPath && $this->uploadDir->exists($oldPath)) {
            $this->uploadDir->delete($oldPath);
        }

        $filename = 'blog-cards-tag-' . $tagId . '-' . Str::lower(Str::random(8)) . '.jpg';
        $this->uploadDir->put($filename, $image);
        $this->settings->set($settingKey, $filename);

        $url = $this->uploadDir->url($filename);

        return new JsonResponse(['url' => $url]);
    }
}
