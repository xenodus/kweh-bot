const mix = require('laravel-mix');

// FONT AWESOME
mix.copy('node_modules/@fortawesome/fontawesome-free/webfonts/*', 'public/css/webfonts/');
// Bootstrap source map
mix.copy('node_modules/bootstrap/dist/js/bootstrap.js.map', 'public/js/compiled/bootstrap.js.map');
mix.copy('node_modules/popper.js/dist/esm/popper.js.map', 'public/js/compiled/popper.js.map');
// Lightbox2
mix.copy('node_modules/lightbox2/dist/images/*', 'public/css/images/');

/*********************************
        CSS
**********************************/

// COMMON CSS
mix.postCss('public/css/style.css', 'public/css/autoprefix/style.css', [
    require('autoprefixer')()
]);

mix.styles([
    'node_modules/normalize.css/normalize.css',
    'node_modules/bootstrap/dist/css/bootstrap.css',
    'node_modules/@fortawesome/fontawesome-free/css/all.css',
    'node_modules/lightbox2/src/css/lightbox.css',
    'public/css/autoprefix/style.css',
], 'public/css/compiled/common.css').version();

/*********************************
        JAVASCRIPT
**********************************/

mix.js('resources/js/app.js', 'public/js').vue();

// COMMON JS
mix.scripts([
    'public/js/app.js',
    'public/js/common.js',
], 'public/js/compiled/common.js').version();