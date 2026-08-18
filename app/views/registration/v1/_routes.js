// ********************************
// Login
// ********************************

// External dependencies
const express = require('express');
const router = express.Router();
const { DateTime } = require("luxon");
const path = require('path');

// ROUTES GO HERE

router.post('/jdr-start', function (req, res) {

    res.redirect('jdr-name?brand=JDR');

});

router.post('/jdr-name', function (req, res) {

    var jdrFirstName = req.session.data['jdr-first-name'];
    var jdrLastName = req.session.data['jdr-last-name'];

    if (jdrFirstName && jdrLastName) {

        res.redirect('jdr-date-of-birth?brand=JDR');

    } else {

        res.redirect('jdr-name?brand=JDR');

    }

});

router.post('/jdr-date-of-birth', function (req, res) {

  const jdrDateOfBirthDay = req.session.data['jdr-date-of-birth']?.day;
  const jdrDateOfBirthMonth = req.session.data['jdr-date-of-birth']?.month;
  const jdrDateOfBirthYear = req.session.data['jdr-date-of-birth']?.year;

  if (
    /^\d+$/.test(jdrDateOfBirthDay) &&
    /^\d+$/.test(jdrDateOfBirthMonth) &&
    /^\d+$/.test(jdrDateOfBirthYear)
  ) {

    const dob = DateTime.fromObject({
      day: Number(jdrDateOfBirthDay),
      month: Number(jdrDateOfBirthMonth),
      year: Number(jdrDateOfBirthYear)
    });

    req.session.data['jdr-date-of-birth'] = dob.toFormat("d MMMM yyyy");

    const age = Math.floor(DateTime.now().diff(dob, 'years').years);

    if (age < 18) {
      return res.redirect('jdr-under-18-drop-out?brand=JDR');
    }

    return res.redirect('jdr-login-preference?brand=JDR');

  } else {

    res.redirect('jdr-date-of-birth?brand=JDR');

  }

});

router.post('/jdr-login-preference', function (req, res) {

    var jdrLoginPreference = req.session.data['jdr-login-preference'];

    if (jdrLoginPreference == "Yes") {

        res.redirect('jdr-phone-number?brand=JDR');

    } else if (jdrLoginPreference == "No") {

        res.redirect('jdr-email?brand=JDR');

    } else {

        res.redirect('jdr-login-preference?brand=JDR');

    }

});

router.post('/jdr-email', function (req, res) {

    var jdrEmail = req.session.data['jdr-email'];

    if (jdrEmail) {

        res.redirect('jdr-password?brand=JDR');

    } else {

        res.redirect('jdr-email?brand=JDR');

    }

});

router.post('/jdr-password', function (req, res) {

    var jdrPassword = req.session.data['jdr-password'];

    if (jdrPassword) {

        res.redirect('jdr-check-your-email?brand=JDR');

    } else {

        res.redirect('jdr-password?brand=JDR');

    }

});

router.post('/jdr-phone-number', function (req, res) {

    var jdrPhoneNumber = req.session.data['jdr-phone-number'];
    var jdrAlternativePhoneNumber = req.session.data['jdr-alternative-phone-number'];

    if (jdrPhoneNumber) {

        res.redirect('jdr-find-address?brand=JDR');

    } else {

        res.redirect('jdr-phone-number?brand=JDR');

    }

});

router.post('/jdr-find-address', function (req, res) {

    var jdrFindAddress = req.session.data['jdr-postcode'];

    if (jdrFindAddress) {

        res.redirect('jdr-select-address?brand=JDR');

    } else {

        res.redirect('jdr-find-address?brand=JDR');

    }

});

router.post('/jdr-select-address', function (req, res) {

    var jdrSelectAddress = req.session.data['jdr-select-address'];

    if (jdrSelectAddress) {

        res.redirect('jdr-sex-and-gender?brand=JDR');

    } else {

        res.redirect('jdr-find-address?brand=JDR');

    }

});

router.post('/jdr-enter-address', function (req, res) {

    var jdrAddress1 = req.session.data['jdr-address-1'];
    var jdrAddress2 = req.session.data['jdr-address-2'];
    var jdrTown = req.session.data['jdr-town'];
    var jdrCounty = req.session.data['jdr-county'];
    var jdrPostcode = req.session.data['jdr-postcode'];


    if (jdrAddress1 && jdrTown && jdrPostcode) {

        res.redirect('jdr-sex-and-gender?brand=JDR');

    } else {

        res.redirect('jdr-enter-address?brand=JDR');

    }

});

router.post('/jdr-sex-and-gender', function (req, res) {

    var jdrSex = req.session.data['jdr-sex'];
    var jdrGender = req.session.data['jdr-gender'];

    if (jdrSex && jdrGender) {

        res.redirect('jdr-ethnic-group?brand=JDR');

    } else {

        res.redirect('jdr-sex-and-gender?brand=JDR');

    }

});

router.post('/jdr-ethnic-group', function (req, res) {

    var jdrEthnicGroup = req.session.data['jdr-ethnic-group'];

    if (jdrEthnicGroup == "White") {

        res.redirect('jdr-ethnicity-white?brand=JDR');

    } else if (jdrEthnicGroup == "Mixed or multiple ethnic groups") {

        res.redirect('jdr-ethnicity-mixed?brand=JDR');

    } else if (jdrEthnicGroup == "Asian or Asian British") {

        res.redirect('jdr-ethnicity-asian?brand=JDR');

    } else if (jdrEthnicGroup == "Black, African, Carribean or Black British") {

        res.redirect('jdr-ethnicity-black?brand=JDR');

    } else if (jdrEthnicGroup == "Other ethnic group") {

        res.redirect('jdr-ethnicity-other?brand=JDR');

    } else {

        res.redirect('jdr-ethnic-group?brand=JDR');

    }

});

router.post('/jdr-ethnicity-white', function (req, res) {

    var jdrEthnicityWhite = req.session.data['jdr-ethnicity-white'];

    if (jdrEthnicityWhite) {

        res.redirect('jdr-memory-problems?brand=JDR');

    } else {

        res.redirect('jdr-ethnicity-white?brand=JDR');

    }

});

router.post('/jdr-ethnicity-mixed', function (req, res) {

    var jdrEthnicityMixed = req.session.data['jdr-ethnicity-mixed'];

    if (jdrEthnicityMixed) {

        res.redirect('jdr-memory-problems?brand=JDR');

    } else {

        res.redirect('jdr-ethnicity-mixed?brand=JDR');

    }

});

router.post('/jdr-ethnicity-asian', function (req, res) {

    var jdrEthnicityAsian = req.session.data['jdr-ethnicity-asian'];

    if (jdrEthnicityAsian) {

        res.redirect('jdr-memory-problems?brand=JDR');

    } else {

        res.redirect('jdr-ethnicity-asian?brand=JDR');

    }

});

router.post('/jdr-ethnicity-black', function (req, res) {

    var jdrEthnicityBlack = req.session.data['jdr-ethnicity-black'];

    if (jdrEthnicityBlack) {

        res.redirect('jdr-memory-problems?brand=JDR');

    } else {

        res.redirect('jdr-ethnicity-black?brand=JDR');

    }

});

router.post('/jdr-ethnicity-other', function (req, res) {

    var jdrEthnicityOther = req.session.data['jdr-ethnicity-other'];

    if (jdrEthnicityOther) {

        res.redirect('jdr-memory-problems?brand=JDR');

    } else {

        res.redirect('jdr-ethnicity-other?brand=JDR');

    }

});

router.post('/jdr-memory-problems', function (req, res) {

    var jdrMemoryProblems = req.session.data['jdr-memory-problems'];

    if (jdrMemoryProblems == "Yes") {

        res.redirect('jdr-dementia-symptoms?brand=JDR');

    } else if (jdrMemoryProblems == "No") {

        res.redirect('jdr-other-medical-conditions?brand=JDR');

    } else {

        res.redirect('jdr-memory-problems?brand=JDR');

    }

});

router.post('/jdr-dementia-symptoms', function (req, res) {

    var jdrDementiaSymptoms = req.session.data['jdr-dementia-symptoms'];

    if (jdrDementiaSymptoms) {

        res.redirect('jdr-mmse-exam?brand=JDR');

    } else {

        res.redirect('jdr-dementia-symptoms?brand=JDR');

    }

});

router.post('/jdr-mmse-exam', function (req, res) {

    var jdrMMSEExam = req.session.data['jdr-mmse-exam'];

    if (jdrMMSEExam == "Yes") {

        res.redirect('jdr-mmse-score?brand=JDR');

    } else if (jdrMMSEExam == "No") {

        res.redirect('jdr-memory-diagnosis?brand=JDR');

    } else {

        res.redirect('jdr-mmse-exam?brand=JDR');

    }

});

router.post('/jdr-mmse-score', function (req, res) {

    var jdrMMSEScore = Number(req.session.data['jdr-mmse-score']);

    if (!isNaN(jdrMMSEScore) && jdrMMSEScore >= 0 && jdrMMSEScore <= 30) {

        res.redirect('jdr-memory-diagnosis?brand=JDR');

    } else {

        res.redirect('jdr-mmse-score?brand=JDR');

    }

});

router.post('/jdr-memory-diagnosis', function (req, res) {

    var jdrMMSEExam = req.session.data['jdr-memory-diagnosis'];

    if (jdrMMSEExam == "Yes") {

        res.redirect('jdr-dementia-type?brand=JDR');

    } else if (jdrMMSEExam == "No") {

        res.redirect('jdr-other-medical-conditions?brand=JDR');

    } else {

        res.redirect('jdr-memory-diagnosis?brand=JDR');

    }

});

router.post('/jdr-dementia-type', function (req, res) {

    var jdrDementiaType = req.session.data['jdr-dementia-type'];

    if (jdrDementiaType) {

        res.redirect('jdr-other-medical-conditions?brand=JDR');

    } else {

        res.redirect('jdr-dementia-type?brand=JDR');

    }

});

router.post('/jdr-other-medical-conditions', function (req, res) {

    var jdrOtherMedicalConditions = req.session.data['jdr-other-medical-conditions'];

    if (jdrOtherMedicalConditions == "Yes") {

        res.redirect('jdr-other-medical-conditions-type?brand=JDR');

    } else if (jdrOtherMedicalConditions == "No") {

        res.redirect('jdr-pacemaker?brand=JDR');

    } else {

        res.redirect('jdr-other-medical-conditions?brand=JDR');

    }

});

router.post('/jdr-other-medical-conditions-type', function (req, res) {

    var jdrOtherMedicalConditionsType = req.session.data['jdr-other-medical-conditions-type'];

    if (jdrOtherMedicalConditionsType) {

        res.redirect('jdr-pacemaker?brand=JDR');

    } else {

        res.redirect('jdr-other-medical-conditions-type?brand=JDR');

    }

});

router.post('/jdr-pacemaker', function (req, res) {

    var jdrPacemaker = req.session.data['jdr-pacemaker'];

    if (jdrPacemaker) {

        res.redirect('jdr-disabilities?brand=JDR');

    } else {

        res.redirect('jdr-pacemaker?brand=JDR');

    }

});

router.post('/jdr-disabilities', function (req, res) {

    var jdrDisabilities = req.session.data['jdr-disabilities'];

    if (jdrDisabilities) {

        res.redirect('jdr-carer-role?brand=JDR');

    } else {

        res.redirect('jdr-disabilities?brand=JDR');

    }

});

router.post('/jdr-carer-role', function (req, res) {

    var jdrCarerRole = req.session.data['jdr-carer-role'];

    if (jdrCarerRole == "Yes") {

        res.redirect('jdr-care-home-visits?brand=JDR');

    } else if (jdrCarerRole == "No") {

        res.redirect('jdr-contact-preference?brand=JDR');

    } else {

        res.redirect('jdr-carer-role?brand=JDR');

    }

});

router.post('/jdr-care-home-visits', function (req, res) {

    var jdrCareHomeVisits = req.session.data['jdr-care-home-visits'];

    if (jdrCareHomeVisits == "Yes") {

        res.redirect('jdr-visit-frequency?brand=JDR');

    } else if (jdrCareHomeVisits == "No") {

        res.redirect('jdr-contact-preference?brand=JDR');

    } else {

        res.redirect('jdr-care-home-visits?brand=JDR');

    }

});

router.post('/jdr-visit-frequency', function (req, res) {

    var jdrVisitFrequency = req.session.data['jdr-visit-frequency'];

    if (jdrVisitFrequency) {

        res.redirect('jdr-contact-preference?brand=JDR');

    } else {

        res.redirect('jdr-visit-frequency?brand=JDR');

    }

});

router.post('/jdr-contact-preference', function (req, res) {

    var jdrContactPreference = req.session.data['jdr-contact-preference'];

    if (jdrContactPreference) {

        res.redirect('jdr-marketing?brand=JDR');

    } else {

        res.redirect('jdr-contact-preference?brand=JDR');

    }

});

router.post('/jdr-marketing', function (req, res) {

    var jdrMarketing = req.session.data['jdr-marketing'];

    if (jdrMarketing) {

        res.redirect('jdr-referal?brand=JDR');

    } else {

        res.redirect('jdr-marketing?brand=JDR');

    }

});

router.post('/jdr-referal', function (req, res) {

    var jdrReferal = req.session.data['jdr-referal'];

    if (jdrReferal) {

        res.redirect('jdr-check-answers?brand=JDR');

    } else {

        res.redirect('jdr-referal?brand=JDR');

    }

});

router.post('/jdr-check-answers', function (req, res) {

    res.redirect('jdr-confirmation?brand=JDR');

});

// BPOR Registration routes

// What is your name?
router.post('/bpor-name', function(req, res) {
    let name = req.session.data['firstName'];
    let surname = req.session.data['lastName'];

    // Defaulted to show no errors
    let errors = {};

    // If name and surname are entered, proceed to DOB
    if (name && surname) {
        return res.redirect('bpor-dob');
    }

    // If name is missing, show error message for first name
    if (!name) {
        errors.firstName = {
            text: 'Enter your first name',
            href: '#first-name'
        };
    }

    // If surname is missing, show error message for surname
    if (!surname) {
        errors.lastName = {
            text: 'Enter your last name',
            href: '#last-name'
        };
    }

    // Render the template, apply error messages if needed (will show both if both are missing)
    return res.render(path.join(__dirname, "bpor-name"), {
        errors: errors,
        errorList: Object.values(errors)
    });
});

// What is your date of birth?
router.post('/bpor-dob', function (req, res) {
  let day = req.session.data['dob-day'];
  let month = req.session.data['dob-month'];
  let year = req.session.data['dob-year'];

  let errors = {};

  // Work out which parts are missing
  let missing = [];
  if (!day) missing.push('day');
  if (!month) missing.push('month');
  if (!year) missing.push('year');

  if (missing.length) {
    let message = missing.length === 3
      ? 'Enter your date of birth'
      : 'Date of birth must include a ' + joinWithAnd(missing);

    errors.dob = { text: message, href: '#date-of-birth-day' };
    errors.day = missing.includes('day');
    errors.month = missing.includes('month');
    errors.year = missing.includes('year');

    return res.render(path.join(__dirname, "bpor-dob"), {
      errors: errors,
      errorList: [errors.dob]
    });
  }

  let dob = new Date(year, month - 1, day);

  // Check it's a real calendar date (not 31 Feb, etc)
  let isRealDate =
    dob.getFullYear() == Number(year) &&
    dob.getMonth() == Number(month) - 1 &&
    dob.getDate() == Number(day);

  if (!isRealDate) {
    errors.dob = { text: 'Date of birth must be a real date', href: '#date-of-birth-day' };
    errors.day = true;
    errors.month = true;
    errors.year = true;

    return res.render(path.join(__dirname, "bpor-dob"), {
      errors: errors,
      errorList: [errors.dob]
    });
  }

  // Check it's not in the future
  let today = new Date();
  if (dob > today) {
    errors.dob = { text: 'Date of birth must be in the past', href: '#date-of-birth-day' };
    errors.day = true;
    errors.month = true;
    errors.year = true;

    return res.render(path.join(__dirname, "bpor-dob"), {
      errors: errors,
      errorList: [errors.dob]
    });
  }

  // Work out age
  let age = today.getFullYear() - dob.getFullYear();
  let hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) {
    age--;
  }

  if (age < 18) {
    return res.redirect('bpor-under-18');
  }

  return res.redirect('bpor-have-nhs-login');
});

// Small helper for grammatically correct error messages, e.g. "day and year"
function joinWithAnd(arr) {
  if (arr.length === 1) return arr[0];
  return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
}

// Do you have an NHS login?
router.post('/bpor-have-nhs-login', function (req, res) {
    let nhs = req.session.data['have-nhs-login'];

    if (nhs == "yes") {
        return res.redirect('bpor-check-email');
    }

    if (nhs == "no") {
        return res.redirect('bpor-email');
    }

    // Nothing selected
    let errors = {
        nhsLogin: { text: 'Select if you have an NHS login', href: '#have-nhs' }
    };

    return res.render(path.join(__dirname, "bpor-have-nhs-login"), {
        errors: errors,
        errorList: [errors.nhsLogin]
    });
});

// What is your email address?
router.post('/bpor-email', function (req, res) {
    let email = req.session.data['email'];

    let errors = {};

    if (!email) {
        errors.email = {
            text: 'Enter your email address',
            href: '#email'
        };
    } else if (!isValidEmail(email)) {
        errors.email = {
            text: 'Enter an email address in the correct format, like name@example.com',
            href: '#email'
        };
    }

    if (errors.email) {
        return res.render(path.join(__dirname, "bpor-email"), {
            errors: errors,
            errorList: [errors.email]
        });
    }

    return res.redirect('bpor-password');
});

// Simple email format check
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Enter a password
router.post('/bpor-password', function (req, res) {
    let password = req.session.data['password'];

    let errors = {};

    if (!password) {
        errors.password = {
            text: 'Enter a password',
            href: '#password'
        };

        return res.render(path.join(__dirname, "bpor-password"), {
            errors: errors,
            errorList: [errors.password]
        });
    }

    return res.redirect('bpor-check-email');
});

// What is your phone number?
router.post('/bpor-phone-number', function (req, res) {
    let phone = req.session.data['phone-number'];

    let errors = {};

    if (!phone) {
        errors.phone = {
            text: 'Enter a phone number',
            href: '#phone-number'
        };

        return res.render(path.join(__dirname, "bpor-phone-number"), {
            errors: errors,
            errorList: [errors.phone]
        });
    }

    return res.redirect('bpor-find-address');
});

// What is your address? (Enter your postcode)
router.post('/bpor-find-address', function (req, res) {
    let postcode = req.session.data['postcode'];

    let errors = {};

    if (!postcode) {
        errors.postcode = {
            text: 'Enter a postcode',
            href: '#postcode'
        };

        return res.render(path.join(__dirname, "bpor-find-address"), {
            errors: errors,
            errorList: [errors.postcode]
        });
    }

    return res.redirect('bpor-select-address');
});

// What is your address? (Select your address)
router.post('/bpor-select-address', function (req, res) {
    // An address is already pre-selected with current design, so error wont fire as select is not 'empty' therefore continue...
    res.redirect('bpor-sex-and-gender');
});

// What is your address? (Enter manually)
router.post('/bpor-enter-address', function (req, res) {
    let addressLine1 = req.session.data['addressLine1'];
    let city = req.session.data['city'];
    let postcode = req.session.data['postcode'];

    let errors = {};

    if (!addressLine1) {
        errors.addressLine1 = {
            text: 'Enter address line 1',
            href: '#address-line-1'
        };
    }

    if (!city) {
        errors.city = {
            text: 'Enter town or city',
            href: '#city'
        };
    }

    if (!postcode) {
        errors.postcode = {
            text: 'Enter a postcode',
            href: '#postcode'
        };
    }

    if (Object.keys(errors).length) {
        return res.render(path.join(__dirname, "bpor-enter-address"), {
            errors: errors,
            errorList: Object.values(errors)
        });
    }

    return res.redirect('bpor-sex-and-gender');
});

// End Routes

module.exports = router;