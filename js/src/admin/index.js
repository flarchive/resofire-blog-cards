import app from 'flarum/admin/app';
import Settings from './components/Settings';

app.initializers.add('resofire/blog-cards', () => {
  // Flarum 2.x: app.extensionData does NOT exist.
  // The correct API is app.registry.for(...).registerPage(...)
  // Confirmed in framework/core/js/src/admin/AdminApplication.tsx:
  //   registry = new AdminRegistry();
  // and AdminRegistry.ts exposes for() and registerPage().
  app.registry.for('resofire-blog-cards').registerPage(Settings);
});
