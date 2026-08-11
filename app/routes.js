const express = require('express');
const router = express.Router();

// ****************************************
// Error Logging
// ****************************************

router.use((req, res, next) => {
    const log = {
        method: req.method,
        url: req.originalUrl, //URL of page
        data: req.session.data //all data held
    }
    console.log(JSON.stringify(log, null, 2)) // show all data as a dump in terminal
    next() // continue to next action

})

// GET FOLDER NAME - useful for relative templates
router.use('/', (req, res, next) => {
    req.folder = req.originalUrl.split('/')[1]; //folder, e.g. 'current'
    req.subfolder = req.originalUrl.split('/')[2]; //sub-folder e.g. 'service'
    res.locals.folder = req.folder; // what folder the url is
    res.locals.subfolder = req.subfolder; // what subfolder the URL is in
    console.log('folder : ' + res.locals.folder + ', subfolder : ' + res.locals.subfolder);
    next();
});

// Check current and previous - good for debugging
router.use('/', (req, res, next) => {
    res.locals.currentURL = req.originalUrl; //current screen
    res.locals.prevURL = req.get('Referrer'); // previous screen
    console.log('previous page is: ' + res.locals.prevURL + " and current page is " + res.locals.currentURL);
    next();
});

// ****************************************
// Route File Versions
// ****************************************

router.use('/login/v1', require('./views/login/v1/_routes'));
router.use('/registration/v1', require('./views/registration/v1/_routes'));

// router.use('/study-search/v1', require('./views/study-search/v1/_routes'));

router.use('/pre-screener/v1', require('./views/pre-screener/v1/_routes'));


//LOGIN-----------
router.post('/bpor-login-recovery-answer', function(request, response) {
  
  // Grab the value of the selected radio button from the session data
  var recoveryChoice = request.session.data['exampleHints']

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
  var recoveryChoice = request.session.data['exampleHints']

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
  var recoveryChoice = request.session.data['exampleHints']

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
  var recoveryChoice = request.session.data['exampleHints']

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
