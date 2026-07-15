// ********************************
// Volunteer
// ********************************

// External dependencies
const express = require('express');
const router = express.Router();

// Volunteer MVP

router.post('/start', function (req, res) {
 
    res.redirect('confirm-identity');

})

router.post('/confirm-identity', function (req, res) {
 
    res.redirect('condition-1');

})


router.post('/condition-1', function (req, res) {

    var conditionQuestion1 = req.session.data['conditionQuestion1'];

    if (conditionQuestion1 == "Yes") {
        res.redirect('condition-2');
    } else if (conditionQuestion1 == "No") {
        res.redirect('no-check-your-answers');
    } else {
        res.redirect('condition-1');

    }

})

router.post('/condition-2', function (req, res) {

    var conditionQuestion2 = req.session.data['conditionQuestion2'];

    if (conditionQuestion2 == "Yes") {
        res.redirect('condition-3');
    } else if (conditionQuestion2 == "No") {
        res.redirect('no-check-your-answers');
    } else {
        res.redirect('condition-2');

    }

})

router.post('/condition-3', function (req, res) {

    var conditionQuestion3 = req.session.data['conditionQuestion3'];

    if (conditionQuestion3 == "Yes") {
        res.redirect('medication-1');
    } else if (conditionQuestion3 == "No") {
        res.redirect('no-check-your-answers');
    } else {
        res.redirect('condition-3');

    }

})

router.post('/medication-1', function (req, res) {

    var medicationQuestion1 = req.session.data['medicationQuestion1'];

    if (medicationQuestion1 == "Yes") {
        res.redirect('medication-2');
    } else if (medicationQuestion1 == "No") {
        res.redirect('no-check-your-answers');
    } else {
        res.redirect('medication-1');

    }

})

router.post('/medication-2', function (req, res) {

    var medicationQuestion2 = req.session.data['medicationQuestion2'];

    if (medicationQuestion2 == "Yes") {
        res.redirect('medication-3');
    } else if (medicationQuestion2 == "No") {
        res.redirect('no-check-your-answers');
    } else {
        res.redirect('medication-2');

    }

})

router.post('/medication-3', function (req, res) {

    var medicationQuestion3 = req.session.data['medicationQuestion3'];

    if (medicationQuestion3 == "Yes") {
        res.redirect('review-details');
    } else if (medicationQuestion3 == "No") {
        res.redirect('no-check-your-answers');
    } else {
        res.redirect('medication-3');

    }

})

/*
router.post('/diagnosis', function (req, res) {

    var diagnosisQuestion = req.session.data['diagnosisQuestion'];

    if (diagnosisQuestion == "Yes") {
        res.redirect('hospital');
    } else if (diagnosisQuestion == "No") {
        res.redirect('no-match');
    } else {
        res.redirect('diagnosis');

    }

})

router.post('/hospital', function (req, res) {

    var hospitalQuestion = req.session.data['hospitalQuestion'];

    if (hospitalQuestion == "Yes") {
        res.redirect('how-long-metformin');
    } else if (hospitalQuestion == "No") {
        res.redirect('how-long-metformin');
    } else {
        res.redirect('hospital');

    }

})

router.post('/how-long-metformin', function (req, res) {

    var metforminHowLongQuestion = req.session.data['metforminHowLongQuestion'];

    if (metforminHowLongQuestion == "Yes") {
        res.redirect('woman');
    } else if (metforminHowLongQuestion == "No") {
        res.redirect('no-match');
    } else {
        res.redirect('how-long-metformin');

    }

})

router.post('/woman', function (req, res) {

    var womanQuestion = req.session.data['womanQuestion'];

    if (womanQuestion == "Yes") {
        res.redirect('consent-target-medication');
    } else if (womanQuestion == "No") {
        res.redirect('no-match');
    } else {
        res.redirect('woman');

    }

})

router.post('/consent-target-medication', function (req, res) {

    var consentTargetMedicationQuestion = req.session.data['consentTargetMedicationQuestion'];

    if (consentTargetMedicationQuestion == "Yes") {
        res.redirect('review-details');
    } else if (consentTargetMedicationQuestion == "No") {
        res.redirect('no-match');
    } else {
        res.redirect('consent-target-medication');

    }

})

*/

router.post('/review-details', function (req, res) {

    var phoneNumber = req.session.data['phoneNumber'];

    res.redirect('check-your-answers');

})

router.post('/no-check-your-answers', function (req, res) {

    res.redirect('no-match');

})

router.post('/check-your-answers', function (req, res) {

    var conditionQuestion1 = req.session.data['conditionQuestion1'];
    var medicationQuestion1 = req.session.data['medicationQuestion1'];
    var diagnosisQuestion = req.session.data['diagnosisQuestion'];
    var hospitalQuestion = req.session.data['hospitalQuestion'];
    var metforminHowLongQuestion = req.session.data['metforminHowLongQuestion'];
    var womanQuestion = req.session.data['womanQuestion'];
    var consentTargetMedicationQuestion = req.session.data['consentTargetMedicationQuestion'];

    if (conditionQuestion1 === "Yes" && medicationQuestion1 === "Yes") {
        res.redirect('match');
    } else if (hospitalQuestion === "Yes" || hospitalQuestion === "No") {
        res.redirect('partial-match');
    }

})

// End Routes

module.exports = router;