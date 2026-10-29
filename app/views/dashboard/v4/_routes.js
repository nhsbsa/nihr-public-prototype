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

    // Opt-in flash — only fires if asked, keeps dev-nav state links working
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

    // returnTo=home keeps the save on-page (jump via anchor), same
    // pattern as the search feed. details.html's form skips returnTo on purpose.
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

router.post('/dismiss-recommended-study', function (req, res) {

    if (!req.session.data.dismissedStudies) {
        req.session.data.dismissedStudies = [];
    }

    if (req.body.studyTitle && req.session.data.dismissedStudies.indexOf(req.body.studyTitle) === -1) {
        req.session.data.dismissedStudies.push(req.body.studyTitle);
    }

    if (req.body.returnTo === 'home') {
        return res.redirect('/dashboard/v4/home' + (req.body.anchor ? ('#' + req.body.anchor) : ''));
    }

    res.redirect('home');

})

function undismissRecommendedStudy(req, res) {

    const input = req.method === 'POST' ? req.body : req.query;

    if (req.session.data.dismissedStudies && input.studyTitle) {
        const index = req.session.data.dismissedStudies.indexOf(input.studyTitle);
        if (index !== -1) {
            req.session.data.dismissedStudies.splice(index, 1);
        }
    }

    if (input.returnTo === 'home') {
        return res.redirect('/dashboard/v4/home' + (input.anchor ? ('#' + input.anchor) : ''));
    }

    res.redirect('home');

}

router.get('/undismiss-recommended-study', undismissRecommendedStudy);
router.post('/undismiss-recommended-study', undismissRecommendedStudy);

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
