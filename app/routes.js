// External dependencies
const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

// Load and parse the health conditions taxonomy JSON file
const healthConditions = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/health-conditions.json'), 'utf8')
)

// Load and parse the dummy studies JSON file
const studies = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/studies.json'), 'utf8')
)

const statusTagClasses = {
  'recruiting': 'green',
  'completed': 'blue',
  'not-recruiting': 'red',
  'stopped': 'grey'
}

// Helper to programmatically generate the hidden/conditional HTML checkboxes for each category
function buildConditionalHtml(categorySlug, items) {
  const checkboxesHtml = items.map((item, index) => {
    const id = index === 0 ? `${categorySlug}-sub` : `${categorySlug}-sub-${index + 1}`
    return `
      <div class="nhsuk-checkboxes__item">
        <input class="nhsuk-checkboxes__input" id="${id}" name="${categorySlug}Sub" type="checkbox" value="${item.value}">
        <label class="nhsuk-label nhsuk-checkboxes__label" for="${id}">${item.text}</label>
      </div>`
  }).join('')

  return `
    <div class="nhsuk-form-group">
      <fieldset class="nhsuk-fieldset">
        <legend class="nhsuk-fieldset__legend nhsuk-fieldset__legend--s">Select any specific conditions</legend>
        <div class="nhsuk-checkboxes">${checkboxesHtml}</div>
      </fieldset>
    </div>`
}

// Helper to map the JSON into the exact structure the NHS.UK Checkboxes macro expects
function buildHealthConditionItems(selectedValue) {
  const items = Object.keys(healthConditions).map(slug => {
    const category = healthConditions[slug]
    return {
      value: slug,
      text: category.text,
      selected: slug === selectedValue
    }
  })

  // Prepend a default "All" option to the front of the dropdown list array
  items.unshift({
    value: "_all",
    text: "All health conditions",
    selected: !selectedValue || selectedValue === "_all"
  })

  return items
}

// Helper to convert selected health condition slugs back into friendly labels
function getHealthConditionLabels(selectedSlugs) {
  if (!selectedSlugs) return []
  const slugsArray = Array.isArray(selectedSlugs) ? selectedSlugs : [selectedSlugs]
  return slugsArray.map(slug => (healthConditions[slug] ? healthConditions[slug].text : slug))
}

// Friendly labels for location preference radio values
const locationPreferenceLabels = {
  'anywhere-in-uk': 'Anywhere in the UK',
  'remote-only': 'Remote only',
  'specific-area': 'A specific area'
}

// --------------------------------------------------------
// Initial Questionnaire Flow (1 to 5)
// --------------------------------------------------------

router.get('/v1/home', function (req, res) {
  res.render('v1/home')
})

router.get('/v1/questions/question-1', function (req, res) {
  res.render('v1/questions/question-1', {
    currentQuestion: 1,
    totalQuestions: 5,
    step: 1,
    questionTitle: "What's your sex?"
  });
});

router.post('/v1/questions/question-1', function (req, res) {
  res.redirect('/v1/questions/question-2')
});

router.get('/v1/questions/question-2', function (req, res) {
  res.render('v1/questions/question-2', {
    currentQuestion: 2,
    totalQuestions: 5,
    step: 2,
    questionTitle: "What is your phone number"
  });
});

router.post('/v1/questions/question-2', function (req, res) {
  res.redirect('/v1/questions/question-3')
});

router.get('/v1/questions/question-3', function (req, res) {
  if (req.session.data) {
    delete req.session.data.healthConditions;
    delete req.session.data.healthCondition;
    Object.keys(req.session.data).forEach(key => {
      if (key.endsWith('Sub')) delete req.session.data[key];
    });
  }

  const subCategoryGroups = Object.keys(healthConditions).map(slug => {
    return {
      slug: slug,
      text: healthConditions[slug].text,
      items: healthConditions[slug].items
    }
  })

  res.render('v1/questions/question-3', {
    currentQuestion: 3,
    totalQuestions: 5,
    step: 3,
    questionTitle: "Areas of research",
    healthConditionItems: buildHealthConditionItems(),
    subCategoryGroups: subCategoryGroups 
  });
});

router.post('/v1/questions/question-3', function (req, res) {
  res.redirect('/v1/questions/question-4')
});

router.get('/v1/questions/question-4', function (req, res) {
  res.render('v1/questions/question-4', {
    currentQuestion: 4,
    totalQuestions: 5,
    step: 4,
    questionTitle: "Location"
  });
});

router.post('/v1/questions/question-4', function (req, res) {
  res.redirect('/v1/questions/question-5')
});

router.get('/v1/questions/question-5', function (req, res) {
  res.render('v1/questions/question-5', {
    currentQuestion: 5,
    totalQuestions: 5,
    step: 5,
    questionTitle: "Review completion"
  });
});

router.post('/v1/questions/question-5', function (req, res) {
  res.redirect('/v1/questions/interruption-page')
});

// Interruption Card Bridge Page
router.get('/v1/questions/interruption-page', function (req, res) {
  res.render('v1/questions/question-6')
});


// --------------------------------------------------------
// Account Registration Flow (1 to 5)
// --------------------------------------------------------

router.get('/v1/register/register-1', function (req, res) {
  res.render('v1/register/register-1', {
    currentQuestion: 1,
    totalQuestions: 4,
    step: 1,
    questionTitle: "What is your name?"
  });
});

router.post('/v1/register/register-1', function (req, res) {
  res.redirect('/v1/register/register-2')
});

router.get('/v1/register/register-2', function (req, res) {
  res.render('v1/register/register-2', {
    currentQuestion: 2,
    totalQuestions: 4,
    step: 2,
    questionTitle: "What is your email address?"
  });
});

router.post('/v1/register/register-2', function (req, res) {
  res.redirect('/v1/register/register-3')
});

router.get('/v1/register/register-3', function (req, res) {
  res.render('v1/register/register-3', {
    currentQuestion: 3,
    totalQuestions: 4,
    step: 3,
    questionTitle: "Create a password"
  });
});

router.post('/v1/register/register-3', function (req, res) {
  res.redirect('/v1/register/register-4')
});

router.get('/v1/register/register-4', function (req, res) {
  res.render('v1/register/register-4', {
    currentQuestion: 4,
    totalQuestions: 4,
    step: 4,
    questionTitle: "What is your date of birth?"
  });
});

router.post('/v1/register/register-4', function (req, res) {
  res.redirect('/v1/register/register-5')
});

router.get('/v1/register/register-5', function (req, res) {
  res.render('v1/register/register-5', {
    questionTitle: "Check your answers"
  });
});

router.post('/v1/register/register-5', function (req, res) {
  res.redirect('/v1/questions/check-your-answers')
});

router.get('/v1/questions/check-your-answers', function (req, res) {
  const data = req.session.data || {}
  res.render('v1/questions/check-your-answers', {
    healthConditionLabels: getHealthConditionLabels(data.healthConditions).join(', '),
    locationPreferenceLabel: locationPreferenceLabels[data.locationPreference] || data.locationPreference
  });
});

router.post('/v1/questions/check-your-answers', function (req, res) {
  res.redirect('/v1/register/confirmation')
});

router.get('/v1/register/confirmation', function (req, res) {
  res.render('v1/register/confirmation')
});


// --------------------------------------------------------
// Search Feed & Filtering Engine
// --------------------------------------------------------

router.get('/v1/search', function (req, res) {
  res.render('v1/search')
})

router.all('/v1/search-results', function (req, res) {
  if (req.query.clear === 'true') {
    req.session.data = {}
    res.locals.data = {}
  }

  const inputSource = req.method === 'POST' ? req.body : req.query
  const { keywords, status } = inputSource

  const sd = req.session.data || {}
  const location = inputSource.location || sd.location
  const hasSubConditions = Object.keys(sd).some(key => key.endsWith('Sub') && Array.isArray(sd[key]) && sd[key].length > 0)

  const chosenCondition = inputSource.healthCondition ||
                          sd.healthCondition ||
                          (Array.isArray(sd.healthConditions) ? sd.healthConditions[0] : sd.healthConditions);

  let results = [...studies]

  if (keywords) {
    results = results.filter(study =>
      study.title.toLowerCase().includes(keywords.toLowerCase())
    )
  }

  if (location) {
    results = results.filter(study =>
      study.locations.some(loc => loc.toLowerCase().includes(location.toLowerCase()))
    )
  }

  if (status) {
    const activeStatuses = Array.isArray(status) ? status : [status]
    results = results.filter(study => activeStatuses.includes(study.status))
  }

  if (chosenCondition && chosenCondition !== '_all') {
    results = results.filter(study =>
      Array.isArray(study.conditionCategories) && study.conditionCategories.includes(chosenCondition)
    )
  }

  const formattedResults = results.map(study => {
    const statusLabel = study.status ? study.status.charAt(0).toUpperCase() + study.status.slice(1) : 'Unknown'
    return {
      ...study,
      statusLabel: study.statusLabel || statusLabel,
      conditionText: study.conditionText || study.conditions || 'Not specified',
      genderLabel: study.genderLabel || study.gender || 'All',
      ageLabel: study.ageLabel || study.age || 'All ages',
      closingDate: study.closingDate || null,
      tagClass: statusTagClasses[study.status] || 'grey'
    }
  })

  return res.render('v1/searchfeed/search-feed', {
    resultsCount: formattedResults.length,
    results: formattedResults,
    healthConditionItems: buildHealthConditionItems(chosenCondition),
    healthConditions: healthConditions,
    hasSubConditions: hasSubConditions
  })
})

module.exports = router