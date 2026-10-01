const express = require('express');
const router = express.Router();

router.use(function (req, res, next) {

    res.locals.query = req.query;

    next();

})

// studyId -> display title, used by the generic save/dismiss logic below so every
// triage form (save-match-response and study-response-handler) can resolve a title
// without each card having to post it separately
var studyTitlesById = {
    'early-memory-changes': 'Understanding early memory changes in over-65s',
    'diet-lifestyle-survey': 'Diet and lifestyle survey for people with type 2 diabetes',
    'sleep-cognitive-health': 'Sleep patterns and cognitive health questionnaire',
    'osteoarthritis-pain-management': 'Osteoarthritis Pain Management & Mobility Study'
};

function addToSessionArray(sessionData, arrayName, value) {

    if (!sessionData[arrayName]) {
        sessionData[arrayName] = [];
    }

    if (sessionData[arrayName].indexOf(value) === -1) {
        sessionData[arrayName].push(value);
    }

}

function removeFromSessionArray(sessionData, arrayName, value) {

    if (!sessionData[arrayName]) {
        return;
    }

    var index = sessionData[arrayName].indexOf(value);

    if (index !== -1) {
        sessionData[arrayName].splice(index, 1);
    }

}

// Shared by every triage form: a 'yes' saves the study to the Saved studies tab,
// a 'no' moves it to the Not interested tab, and either one clears it from the
// other list so a changed answer doesn't leave the study showing in both places.
function recordStudyResponse(req, studyId, response) {

    var studyTitle = studyTitlesById[studyId];

    if (!studyTitle) {
        return;
    }

    if (response === 'yes') {
        addToSessionArray(req.session.data, 'savedStudies', studyTitle);
        removeFromSessionArray(req.session.data, 'notInterestedStudies', studyTitle);
    } else if (response === 'no') {
        addToSessionArray(req.session.data, 'notInterestedStudies', studyTitle);
        removeFromSessionArray(req.session.data, 'savedStudies', studyTitle);
    }

}

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

    req.session.data.savedStudies.push(req.body.studyTitle);

    res.redirect('/dashboard/v2/details?saved=true');

})

router.post('/save-match-response', function (req, res) {

    var studyId = req.body.studyId;
    var response = req.body.study1Response || req.body.study3Response;

    recordStudyResponse(req, studyId, response);

    res.redirect('/dashboard/v2/home?updated=true');

})

router.post('/study-response-handler', function (req, res) {

    var studyId = req.body.studyId;
    var response = req.body.study2Response || req.body.study4Response;
    var showGenericSavedBanner = true;

    recordStudyResponse(req, studyId, response);

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
