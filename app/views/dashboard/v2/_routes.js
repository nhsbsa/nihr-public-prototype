const express = require('express');
const router = express.Router();

router.use(function (req, res, next) {

    res.locals.query = req.query;

    next();

})

router.post('/save-status', function (req, res) {

    var accountStatus = req.session.data['accountStatus'];

    if (accountStatus === 'optout') {
        res.redirect('archive');
    } else {
        res.redirect('home');
    }

})

router.post('/switch-profile', function (req, res) {

    var activeProfile = req.session.data['activeProfile'];

    if (activeProfile === 'proxy') {
        res.redirect('proxy');
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

    res.redirect('home');

})

router.post('/save-study', function (req, res) {

    if (!req.session.data.savedStudies) {
        req.session.data.savedStudies = [];
    }

    req.session.data.savedStudies.push(req.body.studyTitle);

    res.redirect('/dashboard/v2/details?saved=true');

})

router.post('/save-match-response', function (req, res) {

    res.redirect('/dashboard/v2/home?updated=true');

})

router.post('/study-response-handler', function (req, res) {

    var studyId = req.body.studyId;
    var showGenericSavedBanner = true;

    if (studyId === 'osteoarthritis-pain-management') {

        if (req.body.study4Response === 'yes') {
            req.session.data['accountStatus'] = 'paused';
            // flash only - accountStatus stays set, it also drives the heading/profile UI
            req.flash('responseSaved', true);
            showGenericSavedBanner = false;
        }

    } else if (studyId === 'diet-lifestyle-survey') {

        if (req.body.study2Response === 'undecided') {

            req.session.data['diabetesStudyStatus'] = 'undecided';

            if (!req.session.data.savedStudies) {
                req.session.data.savedStudies = [];
            }

            var dietStudyTitle = 'Diet and lifestyle survey for people with type 2 diabetes';

            if (req.session.data.savedStudies.indexOf(dietStudyTitle) === -1) {
                req.session.data.savedStudies.push(dietStudyTitle);
            }

            // flash only - diabetesStudyStatus stays set, it also gates content below
            req.flash('studySaved', true);
            showGenericSavedBanner = false;

        }

    }

    if (showGenericSavedBanner) {
        res.redirect('/dashboard/v2/home?updated=true');
    } else {
        res.redirect('/dashboard/v2/home');
    }

})

router.post('/edit-interests', function (req, res) {

    res.redirect('/dashboard/v2/profile?updated=true');

})

router.post('/edit-health-conditions', function (req, res) {

    res.redirect('/dashboard/v2/profile?updated=true');

})

router.post('/save-contact-preferences', function (req, res) {

    res.redirect('profile');

})

router.post('/check-eligibility', function (req, res) {

    var ageCriteria = req.session.data['ageCriteria'];
    var diagnosisCriteria = req.session.data['diagnosisCriteria'];
    var partnerCriteria = req.session.data['partnerCriteria'];

    if (ageCriteria === 'No' || diagnosisCriteria === 'No' || partnerCriteria === 'No') {
        res.redirect('pre-screener-ineligible');
    } else {
        res.redirect('pre-screener-cya');
    }

})

module.exports = router;
