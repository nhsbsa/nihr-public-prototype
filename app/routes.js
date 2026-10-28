const express = require('express');
const router = express.Router();
const fs = require('node:fs')
const path = require('node:path')

// ****************************************
// Additional Logging
// ****************************************

router.use((req, res, next) => {
    const log = {
        method: req.method,
        url: req.originalUrl, // URL of page
        data: req.session.data // all data held
    }
    console.log(JSON.stringify(log, null, 2)) // show all data as a dump in terminal
    next() // continue to next action

})

// Get folder name (useful for relative templates)

router.use('/', (req, res, next) => {
    req.folder = req.originalUrl.split('/')[1]; //folder, e.g. 'current'
    req.subfolder = req.originalUrl.split('/')[2]; //sub-folder e.g. 'service'
    res.locals.folder = req.folder; // what folder the url is
    res.locals.subfolder = req.subfolder; // what subfolder the URL is in
    console.log('folder : ' + res.locals.folder + ', subfolder : ' + res.locals.subfolder);
    next();
});

// Check current and previous (good for debugging)

router.use('/', (req, res, next) => {
    res.locals.currentURL = req.originalUrl; //current screen
    res.locals.prevURL = req.get('Referrer'); // previous screen
    console.log('previous page is: ' + res.locals.prevURL + " and current page is " + res.locals.currentURL);
    next();
});


// ****************************************
// Sitemap Crawler
// ****************************************

// Sitemap configuration. (add any folders that need excluding within '/app/views' here)

const sitemapExcludedFolders = [
  '_components',
  'includes',
  'partials'
]

router.get('/sitemap', (req, res) => {
  const viewsRoot = path.resolve(__dirname, 'views')

  function scanDirectory(directory, relativeDirectory = '') {
    const entries = fs.readdirSync(directory, {
      withFileTypes: true
    })

    const items = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (sitemapExcludedFolders.includes(entry.name)) {
          continue
        }

        const relativePath = path.join(
          relativeDirectory,
          entry.name
        )

        const children = scanDirectory(
          path.join(directory, entry.name),
          relativePath
        )

        if (children.length) {
          items.push({
            type: 'folder',
            name: entry.name,
            children
          })
        }

        continue
      }

    if (!entry.isFile()) continue

    // Ignore files directly inside app/views/

    if (relativeDirectory === '') continue

    // Only include HTML templates

    if (path.extname(entry.name) !== '.html') continue

      const relativePath = path.join(
        relativeDirectory,
        entry.name
      )

      const routePath = relativePath
        .split(path.sep)
        .join('/')
        .replace(/\.(html|njk)$/, '')
        .replace(/(^|\/)index$/, '$1')
        .replace(/\/$/, '')

      items.push({
        type: 'page',
        name: path.basename(entry.name, path.extname(entry.name)),
        file: relativePath.split(path.sep).join('/'),
        url: routePath ? `/${routePath}` : '/'
      })
    }

    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }

      return a.name.localeCompare(b.name)
    })
  }

  try {
    res.render('sitemap.html', {
      sitemap: scanDirectory(viewsRoot)
    })
  } catch (error) {
    console.error('Unable to generate sitemap:', error)
    res.status(500).send('Unable to generate sitemap.')
  }
})

// ****************************************
// Route File Versions
// ****************************************

router.use('/dashboard/v1', require('./views/dashboard/v1/_routes'));

router.use('/dashboard/v2', require('./views/dashboard/v2/_routes'));

router.use('/dashboard/v3', require('./views/dashboard/v3/_routes'));

router.use('/dashboard/v4', require('./views/dashboard/v4/_routes'));

router.use('/dashboard/v5', require('./views/dashboard/v5/_routes'));

router.use('/login/v1', require('./views/login/v1/_routes'));

router.use('/registration/v1', require('./views/registration/v1/_routes'));

router.use('/study-search/v2', require('./views/study-search/v2/_routes'));

router.use('/study-search/v3', require('./views/study-search/v3/_routes'));

router.use('/study-search/v4', require('./views/study-search/v4/_routes'));

router.use('/pre-screener/v1', require('./views/pre-screener/v1/_routes'));



//LOGIN-----------
router.post('/bpor-login-recovery-answer', function(request, response) {
  
  // Grab the value of the selected radio button from the session data
  const recoveryChoice = request.session.data['exampleHints']

  // Route the user based on the selected value
  if (recoveryChoice == "bpor-phone") {
    response.redirect("/login/v1/bpor/mfa-phone-number-resend")
  } else if (recoveryChoice == "bpor-email") {
    response.redirect("/login/v1/bpor/mfa-email")
  } else if (recoveryChoice == "bpor-support") {
    response.redirect("/login/v1/bpor/mfa-contact-support")
  } else {
    // A fallback page if they somehow submit without an answer
    response.redirect("/error-page") 
  }
})


router.post('/jdr-login-recovery-answer', function(request, response) {
  
  // Grab the value of the selected radio button from the session data
  const recoveryChoice = request.session.data['exampleHints']

  // Route the user based on the selected value
  if (recoveryChoice == "jdr-phone") {
    response.redirect("/login/v1/jdr/mfa-phone-number-resend")
  } else if (recoveryChoice == "jdr-email") {
    response.redirect("/login/v1/jdr/mfa-email")
  } else if (recoveryChoice == "jdr-support") {
    response.redirect("/login/v1/jdr/mfa-contact-support")
  } else {
    // A fallback page if they somehow submit without an answer
    response.redirect("/error-page") 
  }
})



router.post('/bpor-login-mfa-setup', function(request, response) {
  
  // Grab the value of the selected radio button from the session data
  const recoveryChoice = request.session.data['exampleHints']

  // Route the user based on the selected value
  if (recoveryChoice == "bpor-phone") {
    response.redirect("/login/v1/bpor/mfa-phone-number-setup")
  } else if (recoveryChoice == "bpor-email") {
    response.redirect("/login/v1/bpor/mfa-email-setup")
  } else if (recoveryChoice == "bpor-authenticator") {
    response.redirect("/login/v1/bpor/mfa-authenticator-app-setup")
  } else {
    // A fallback page if they somehow submit without an answer
    response.redirect("/error-page") 
  }
})


router.post('/jdr-login-mfa-setup', function(request, response) {
  
  // Grab the value of the selected radio button from the session data
  const recoveryChoice = request.session.data['exampleHints']

  // Route the user based on the selected value
  if (recoveryChoice == "jdr-phone") {
    response.redirect("/login/v1/jdr/mfa-phone-number-setup")
  } else if (recoveryChoice == "jdr-email") {
    response.redirect("/login/v1/jdr/mfa-email-setup")
  } else if (recoveryChoice == "jdr-authenticator") {
    response.redirect("/login/v1/jdr/mfa-authenticator-app-setup")
  } else {
    // A fallback page if they somehow submit without an answer
    response.redirect("/error-page") 
  }
})


module.exports = router
