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
// Onboarding & Registration Routes
// --------------------------------------------------------

router.get('/v1/home', function (req, res) {
  res.render('v1/home')
})

router.get('/v1/register/register-1', function (req, res) {
  res.render('v1/register/register-1', {
    currentQuestion: 1,
    totalQuestions: 5,
    questionTitle: "What's your address"
  });
});

router.post('/v1/register/register-1', function (req, res) {
  res.redirect('/v1/register/register-2')
});

router.get('/v1/register/register-2', function (req, res) {
  res.render('v1/register/register-2', {
    currentQuestion: 2,
    totalQuestions: 5,
    questionTitle: "What is your phone number"
  });
});

router.post('/v1/register/register-2', function (req, res) {
  res.redirect('/v1/register/register-3')
});

// GET blocks for the questions (POST blocks removed to let HTML handle routing)

router.get('/v1/questions/question-3', function (req, res) {
  res.render('v1/questions/question-3', {
    currentQuestion: 3,
    totalQuestions: 5,
    questionTitle: "Areas of research",
    healthConditionItems: buildHealthConditionItems()
  });
});

router.get('/v1/questions/question-4', function (req, res) {
  res.render('v1/questions/question-4', {
    currentQuestion: 4,
    totalQuestions: 5,
    questionTitle: "location"
  });
});

router.get('/v1/questions/question-5', function (req, res) {
  res.render('v1/questions/question-5', {
    currentQuestion: 5,
    totalQuestions: 5,
    questionTitle: "location"
  });
});

router.get('/v1/questions/question-6', function (req, res) {
  res.render('v1/questions/question-6', {
    questionTitle: "Create your account"
  });
});

router.get('/v1/questions/check-your-answers', function (req, res) {
  const data = req.session.data
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

// Changed from router.get to router.all to support POST from search filters form
router.all('/v1/search-results', function (req, res) {
  
  // CLEAR FILTERS LOGIC: Drops session memory data completely if ?clear=true is triggered
  if (req.query.clear === 'true') {
    req.session.data = {}
  }

  // Support inputs coming from either query string parameters (GET) or form submission body (POST)
  const inputSource = req.method === 'POST' ? req.body : req.query
  const { keywords, location, status } = inputSource
  
  // Check if the user selected ANY sub-conditions in Q3
  const sd = req.session.data || {}
  const hasSubConditions = Object.keys(sd).some(key => key.endsWith('Sub') && Array.isArray(sd[key]) && sd[key].length > 0)

  // Start baseline with the full list of mock studies
  let results = [...studies]

  // Keyword Text Filter
  if (keywords) {
    results = results.filter(study => 
      study.title.toLowerCase().includes(keywords.toLowerCase())
    )
  }

  // Location Text Filter
  if (location) {
    results = results.filter(study => 
      study.locations.some(loc => loc.toLowerCase().includes(location.toLowerCase()))
    )
  }

  // Status Multiselect Filter
  if (status) {
    const activeStatuses = Array.isArray(status) ? status : [status]
    results = results.filter(study => activeStatuses.includes(study.status))
  }

  // Map fields to guarantee Nunjucks template properties render correctly on the cards
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

  // Render template cleanly and pass the current healthCondition value to handle selections
  return res.render('v1/searchfeed/search-feed', {
    resultsCount: formattedResults.length,
    results: formattedResults,
    healthConditionItems: buildHealthConditionItems(inputSource.healthCondition || sd.healthCondition),
    healthConditions: healthConditions,
    hasSubConditions: hasSubConditions
  })
})

module.exports = router