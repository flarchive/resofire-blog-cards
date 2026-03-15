import app from 'flarum/admin/app';
import Settings from './components/Settings';

app.initializers.add('resofire/blog-cards', () => {
  app.extensionData.for('resofire-blog-cards').registerPage(Settings);
});
