const express = require('express');
const router = express.Router();

router.use(function (req, res, next) {

    res.locals.query = req.query;

    next();

})

router.post('/save-status', function (req, res) {

    const accountStatus = req.session.data['accountStatus'];

    if (accountStatus === 'optout') {
        res.redirect('archive');
    } else {
        res.redirect('home');
    }

})

router.post('/dismiss-study', function (req, res) {

    req.session.data['studyDismissed'] = true;

    res.redirect('home');

})

router.get('/set-state', function (req, res) {

    if (req.query.accountStatus) {
        req.session.data['accountStatus'] = req.query.accountStatus;
    }

    if (req.query.studyDismissed !== undefined) {
        req.session.data['studyDismissed'] = (req.query.studyDismissed === 'true');
    }

    // optional flash trigger - only fires when a caller explicitly asks for it,
    // so the existing dev-nav demo-state links are unaffected
    if (req.query.showFlash === 'responseSaved') {
        req.flash('responseSaved', true);
    }

    res.redirect('home');

})

router.post('/save-study', function (req, res) {

    if (!req.session.data.savedStudies) {
        req.session.data.savedStudies = [];
    }

    if (req.body.studyTitle && req.session.data.savedStudies.indexOf(req.body.studyTitle) === -1) {
        req.session.data.savedStudies.push(req.body.studyTitle);
    }

    // Dashboard study cards pass returnTo=home so the save keeps the user on
    // /dashboard/v4/home (jumping back to the same card via the anchor),
    // matching the search feed's save/unsave pattern. The details.html save
    // form does not set returnTo, so it keeps its original behaviour.
    if (req.body.returnTo === 'home') {
        return res.redirect('/dashboard/v4/home' + (req.body.anchor ? ('#' + req.body.anchor) : ''));
    }

    res.redirect('/dashboard/v4/details?saved=true');

})

function removeStudyFromDashboard(req, res) {

    const input = req.method === 'POST' ? req.body : req.query;

    if (req.session.data.savedStudies && input.studyTitle) {
        const index = req.session.data.savedStudies.indexOf(input.studyTitle);
        if (index !== -1) {
            req.session.data.savedStudies.splice(index, 1);
        }
    }

    if (input.returnTo === 'home') {
        return res.redirect('/dashboard/v4/home' + (input.anchor ? ('#' + input.anchor) : ''));
    }

    res.redirect('/dashboard/v4/saved-studies');

}

router.get('/remove-study', removeStudyFromDashboard);
router.post('/remove-study', removeStudyFromDashboard);

router.post('/edit-interests', function (req, res) {

    res.redirect('/dashboard/v4/account-settings?updated=true');

})

router.post('/edit-health-conditions', function (req, res) {

    res.redirect('/dashboard/v4/account-settings?updated=true');

})

router.post('/save-contact-preferences', function (req, res) {

    res.redirect('account-settings');

})

router.post('/check-eligibility', function (req, res) {

    const ageCriteria = req.session.data['ageCriteria'];
    const diagnosisCriteria = req.session.data['diagnosisCriteria'];
    const partnerCriteria = req.session.data['partnerCriteria'];

    if (ageCriteria === 'No' || diagnosisCriteria === 'No' || partnerCriteria === 'No') {
        res.redirect('pre-screener-ineligible');
    } else {
        res.redirect('pre-screener-cya');
    }

})

module.exports = router;
