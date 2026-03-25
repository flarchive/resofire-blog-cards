import Extend from 'flarum/common/extenders';
import Settings from './components/Settings';

// Flarum 2.x: Register the custom settings page via the Admin extender.
//
// The Admin extender calls app.registry.registerPage(Settings) inside
// app.beforeMount(), which is the correct timing for ExtensionPageResolver
// to find it when the extension route is navigated to.
//
// This must be a NAMED export 'extend' — the admin.js entry point uses
// `export * from './src/admin'` which re-exports named (not default) exports.
// Flarum's bootExtensions() reads extension.extend to find the extenders array.
export const extend = [
  new Extend.Admin().page(Settings),
];
