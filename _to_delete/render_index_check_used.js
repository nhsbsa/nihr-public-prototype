const path = require('path');
const nunjucks = require('nunjucks');
const appPath = process.cwd();
const prototypeKitPath = path.dirname(require.resolve('nhsuk-prototype-kit/package.json'));
const nhsukFrontendPath = path.dirname(require.resolve('nhsuk-frontend/package.json'));
const searchPaths = [
  path.join(appPath, 'app/views'),
  path.join(prototypeKitPath, 'lib/views'),
  path.join(nhsukFrontendPath, 'dist/nhsuk/components'),
  path.join(nhsukFrontendPath, 'dist/nhsuk/macros'),
  path.join(nhsukFrontendPath, 'dist/nhsuk'),
  path.join(nhsukFrontendPath, 'dist'),
];
const env = nunjucks.configure(searchPaths, { noCache: true, lstripBlocks: true, trimBlocks: true });
env.addGlobal('serviceName', 'Be Part of Research');
const customFilters = require('./app/filters.js')(env);
for (const [name, fn] of Object.entries(customFilters)) { env.addFilter(name, fn); }

const pages = [
  ['dashboard/v3.1/home.html', '/dashboard/v3.1/home'],
  ['dashboard/v3.1/account-settings.html', '/dashboard/v3.1/account-settings'],
  ['dashboard/v3.2/home.html', '/dashboard/v3.2/home'],
  ['dashboard/v3.2/account-settings.html', '/dashboard/v3.2/account-settings'],
  ['dashboard/v3.3/home.html', '/dashboard/v3.3/home'],
  ['dashboard/v3.3/account-settings.html', '/dashboard/v3.3/account-settings'],
  ['dashboard/v3.3/archive.html', '/dashboard/v3.3/archive'],
  ['dashboard/v3.3/pause-matching.html', '/dashboard/v3.3/pause-matching'],
  ['dashboard/v3.3/study-osteo/page-1.html', '/dashboard/v3.3/study-osteo/page-1'],
  ['index.html', '/'],
];

let anyError = false;
for (const [tpl, currentPage] of pages) {
  try {
    const out = env.render(tpl, { data: {}, query: {}, currentPage });
    const leftover = (out.match(/dashboard\/v[456](?![.\d])/g) || []);
    console.log(`OK: ${tpl}  (leftover old-version refs: ${leftover.length})`);
    if (leftover.length) { console.log('   leftover matches:', leftover); anyError = true; }
  } catch (e) {
    anyError = true;
    console.log(`ERROR rendering ${tpl}:`, e.message);
  }
}

// Check index.html contains the right new links and none of the old ones
const indexOut = env.render('index.html', { data: {}, query: {}, currentPage: '/' });
console.log('\nindex.html checks:');
console.log(' has v3.1/home link:', indexOut.includes('/dashboard/v3.1/home'));
console.log(' has v3.2/home link:', indexOut.includes('/dashboard/v3.2/home'));
console.log(' has v3.3/home link:', indexOut.includes('/dashboard/v3.3/home'));
console.log(' has v3/home link (Version 3.0):', indexOut.includes('/dashboard/v3/home'));
console.log(' has "Version 3.0 (Round 2 User Testing)":', indexOut.includes('Version 3.0 (Round 2 User Testing)'));
console.log(' has "Version 3.3 (MVP for Dev Handover)":', indexOut.includes('Version 3.3 (MVP for Dev Handover)'));
console.log(' has old "Version 4 (Beyond MVP Concept)":', indexOut.includes('Version 4 (Beyond MVP Concept)'));
console.log(' has old "Version 6 (Design Updates)":', indexOut.includes('Version 6 (Design Updates)'));

process.exit(anyError ? 1 : 0);
