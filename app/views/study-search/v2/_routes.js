const express = require('express')
const router = express.Router()

// Load health conditions JSON data from app/data/
const healthConditionsData = require('../../../data/health-conditions.json')

// Load the dummy studies from app/data/studies.json
const studiesData = require('../../../data/studies.json')

// Works out the session's set of selected health condition slugs after
// applying: initial seed, removeCondition, "_all" clear, or a new pick.
function updateSelectedConditions(session, inputSource, query) {
  if (!Array.isArray(session.data.healthConditions)) {
    session.data.healthConditions = inputSource.healthCondition ? [inputSource.healthCondition] : []
  }

  if (query.removeCondition) {
    session.data.healthConditions = session.data.healthConditions.filter(c => c !== query.removeCondition)
  }

  if (inputSource.healthCondition === '_all') {
    session.data.healthConditions = []
  } else if (inputSource.healthCondition && !session.data.healthConditions.includes(inputSource.healthCondition)) {
    session.data.healthConditions.push(inputSource.healthCondition)
  }

  return session.data.healthConditions.filter(c => c && c !== '_all')
}

// The dropdown can only highlight one value at a time, so work out which
// one that should be: whatever was just picked, or the most recent selection.
function resolveChosenCondition(inputSource, selectedConditions) {
  return (inputSource.healthCondition && inputSource.healthCondition !== '_all')
    ? inputSource.healthCondition
    : selectedConditions[selectedConditions.length - 1]
}

// Applies the keyword, location, status, and condition filters to the study list.
function applyFilters(studies, { keywords, location, activeStatuses, selectedConditions }) {
  let results = [...studies]

  if (keywords) {
    results = results.filter(study => study.title.toLowerCase().includes(keywords.toLowerCase()))
  }

  if (location) {
    results = results.filter(study => study.locations.some(loc => loc.toLowerCase().includes(location.toLowerCase())))
  }

  if (activeStatuses.length > 0) {
    results = results.filter(study => activeStatuses.includes(study.status))
  }

  if (selectedConditions.length > 0) {
    results = results.filter(study =>
      Array.isArray(study.conditionCategories) &&
      study.conditionCategories.some(c => selectedConditions.includes(c))
    )
  }

  return results
}

// UPDATED ROUTE PATH: Now points to the new search-feed URL
router.all('/searchfeed/search-feed', function (req, res) {
  if (req.query.clear === 'true') {
    req.session.data = {}
    res.locals.data = {}
  }

  const inputSource = req.method === 'POST' ? req.body : req.query
  const { keywords, status } = inputSource

  const sd = req.session.data || {}
  const location = inputSource.location || sd.location
  const hasSubConditions = Object.keys(sd).some(key => key.endsWith('Sub') && Array.isArray(sd[key]) && sd[key].length > 0)

  const selectedConditions = updateSelectedConditions(req.session, inputSource, req.query)
  const chosenCondition = resolveChosenCondition(inputSource, selectedConditions)

  const activeStatuses = status
    ? (Array.isArray(status) ? status : [status])
    : (sd.activeStatuses || [])

  req.session.data.location = location
  req.session.data.activeStatuses = activeStatuses

  // UPDATED DATA SOURCE: Pull directly from the imported JSON file
  const studies = studiesData || []

  const results = applyFilters(studies, {
    keywords,
    location,
    activeStatuses,
    selectedConditions
  })

  // UPDATED RENDER DESTINATION: Point to the new template location
  res.render('study-search/v2/searchfeed/search-feed', {
    results,
    resultsCount: results.length, // Added to populate {{ resultsCount }} in your HTML
    keywords,
    location,
    activeStatuses,
    selectedConditions,
    chosenCondition,
    hasSubConditions
  })
})

// ****************************************
// Questions 1–6
// ****************************************

router.post('/questions/question-1', function (req, res) {
  req.session.data.sex = req.body.sex
  req.session.data.genderSameAsSex = req.body.genderSameAsSex

  res.redirect('/study-search/v2/questions/question-2')
})

router.post('/questions/question-2', function (req, res) {
  req.session.data.dateofbirthDay = req.body['dateofbirth-day']
  req.session.data.dateofbirthMonth = req.body['dateofbirth-month']
  req.session.data.dateofbirthYear = req.body['dateofbirth-year']

  res.redirect('/study-search/v2/questions/question-3')
})

// GET Question 3: Render template with the JSON data
router.get('/questions/question-3', function (req, res) {
  res.render('study-search/v2/questions/question-3', {
    healthConditionsData: healthConditionsData
  })
})

// POST Question 3: Save selected checkboxes into session
router.post('/questions/question-3', function (req, res) {
  let healthConditions = req.body.healthConditions

  // Normalize single selected checkbox into an array
  if (healthConditions && !Array.isArray(healthConditions)) {
    healthConditions = [healthConditions]
  }

  req.session.data.healthConditions = healthConditions || []

  res.redirect('/study-search/v2/questions/question-4')
})

// POST Question 4: Save location preference, town/city/postcode, and travel distance into session
router.post('/questions/question-4', function (req, res) {
  req.session.data.locationPreference = req.body.locationPreference

  if (req.body.locationPreference === 'specific-area') {
    req.session.data.location = req.body.location
    req.session.data.travelDistance = req.body.travelDistance
  } else {
    req.session.data.location = ''
    req.session.data.travelDistance = ''
  }

  res.redirect('/study-search/v2/questions/question-5')
})

router.post('/questions/question-5', function (req, res) {
  // TODO: save question-5's fields into req.session.data here
  res.redirect('/study-search/v2/questions/question-6')
})

router.post('/questions/question-6', function (req, res) {
  // TODO: save question-6's fields into req.session.data here
  // UPDATED REDIRECT: Send the user to the correct final page
  res.redirect('/study-search/v2/searchfeed/search-feed')
})

module.exports = router