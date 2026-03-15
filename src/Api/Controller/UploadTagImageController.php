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

        $tagId = (string) Arr::get($request->getQueryParams(), 'tagId');

        $file = Arr::get($request->getUploadedFiles(), 'tagImage');

        $image = $this->imageManager
            ->make($file->getStream()->getMetadata('uri'))
            ->widen(1200, function ($constraint) {
                $constraint->upsize();
            })
            ->encode('jpg', 85);

        // Read existing map, delete old file for this tag if present
        $map = json_decode($this->settings->get('resofire_blog_cards_tag_images', '{}'), true) ?: [];

        if (!empty($map[$tagId]) && $this->uploadDir->exists($map[$tagId])) {
            $this->uploadDir->delete($map[$tagId]);
        }

        $filename = 'blog-cards-tag-' . $tagId . '-' . Str::lower(Str::random(8)) . '.jpg';
        $this->uploadDir->put($filename, $image);

        $map[$tagId] = $filename;
        $this->settings->set('resofire_blog_cards_tag_images', json_encode($map));

        return new JsonResponse(['url' => $this->uploadDir->url($filename)]);
    }
}
