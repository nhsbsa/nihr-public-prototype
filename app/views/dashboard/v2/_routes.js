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
