const express = require('express')
const router = express.Router()

// Load health conditions JSON data from app/data/
const healthConditionsData = require('../../../data/health-conditions.json')

// Load the dummy studies from app/data/studies.json
const studiesData = require('../../../data/studies.json')

// Applies keywords, location, status, condition, sub-condition, AND sorting filters to the study list.
function applyFilters(studies, { keywords, location, activeStatuses, selectedConditions, subCondition, sortBy }) {
  let results = [...studies]

  // 1. Keyword Filter
  if (keywords) {
    results = results.filter(study => study.title.toLowerCase().includes(keywords.toLowerCase()))
  }

  // 2. Location Filter
  if (location && location.trim() !== '') {
    results = results.filter(study => study.locations.some(loc => loc.toLowerCase().includes(location.toLowerCase())))
  }

  // 3. Status Filter
  if (activeStatuses && activeStatuses.length > 0) {
    results = results.filter(study => activeStatuses.includes(study.status))
  }

  // 4. Main Health Condition Category Filter
  if (selectedConditions && selectedConditions.length > 0) {
    results = results.filter(study =>
      Array.isArray(study.conditionCategories) &&
      study.conditionCategories.some(c => selectedConditions.includes(c))
    )
  }

  // 5. Specific Sub-Condition Filter (Flexible matching)
  if (subCondition && subCondition !== 'all' && subCondition !== '') {
    const targetSub = subCondition.toLowerCase().replace(/[-_]/g, ' ').trim()

    results = results.filter(study => {
      const matchingSub = Object.keys(study).some(key => {
        if (Array.isArray(study[key])) {
          return study[key].some(val => 
            String(val).toLowerCase().replace(/[-_]/g, ' ').trim() === targetSub
          )
        }
        return false
      })

      const matchingCategory = Array.isArray(study.conditionCategories) &&
        study.conditionCategories.some(c => String(c).toLowerCase().replace(/[-_]/g, ' ').trim() === targetSub)

      return matchingSub || matchingCategory
    })
  }

  // 6. Sorting Logic
  if (sortBy === 'a-z') {
    results.sort((a, b) => a.title.localeCompare(b.title))
  } else {
    // Default 'most-recent': Sort by ID descending
    results.sort((a, b) => Number(b.id) - Number(a.id))
  }

  return results
}

// ROUTE HANDLER: Handles search feed, dynamic filters, autocomplete searches & sorting
router.all('/searchfeed/search-feed', function (req, res) {
  if (req.query.clear === 'true') {
    req.session.data = {}
    res.locals.data = {}
    return res.redirect('/study-search/v2/searchfeed/search-feed')
  }

  const inputSource = req.method === 'POST' ? req.body : req.query
  const { keywords, status, healthCondition, subCondition, locationPreference, sortBy } = inputSource

  const sd = req.session.data || {}

  // Save location preference to session
  if (locationPreference) {
    req.session.data.locationPreference = locationPreference
  }

  // Only apply location filter if "specific-area" is selected
  let location = ""
  const activeLocPref = req.session.data.locationPreference
  if (activeLocPref === 'specific-area') {
    location = inputSource.location || sd.location || ""
    req.session.data.location = location
  } else {
    req.session.data.location = ""
  }

  // Save selected condition, sub-condition & sortBy to session
  if (healthCondition !== undefined) req.session.data.healthCondition = healthCondition
  if (subCondition !== undefined) req.session.data.subCondition = subCondition
  if (sortBy !== undefined) req.session.data.sortBy = sortBy

  const chosenCondition = req.session.data.healthCondition || ''
  const chosenSubCondition = req.session.data.subCondition || ''
  const chosenSortBy = req.session.data.sortBy || 'most-recent'

  const selectedConditions = chosenCondition && chosenCondition !== '_all' ? [chosenCondition] : []

  // Extract raw status array or string
  let rawStatuses = status
    ? (Array.isArray(status) ? status : [status])
    : (sd.activeStatuses || [])

  // SANITIZE: Filter out empty strings AND Nunjucks '_unchecked' dummy values
  const activeStatuses = rawStatuses.filter(s => s && s.trim() !== '' && s !== '_unchecked')

  req.session.data.activeStatuses = activeStatuses

  // Build the primary health condition dropdown list from health-conditions.json
  const healthConditionItems = [
    { value: "", text: "Select a health condition" }
  ]

  Object.keys(healthConditionsData).forEach(key => {
    healthConditionItems.push({
      value: key,
      text: healthConditionsData[key].text,
      selected: key === chosenCondition
    })
  })

  const studies = studiesData || []

  const results = applyFilters(studies, {
    keywords,
    location,
    activeStatuses,
    selectedConditions,
    subCondition: chosenSubCondition,
    sortBy: chosenSortBy
  })

  res.render('study-search/v2/searchfeed/search-feed', {
    results,
    resultsCount: results.length,
    keywords,
    location,
    activeStatuses,
    selectedConditions,
    chosenCondition,
    chosenSubCondition,
    sortBy: chosenSortBy,
    healthConditionItems,
    healthConditionsData,
    allStudies: studies
  })
})

// ****************************************
// Study Detail Pages (Dynamic Routing)
// ****************************************

router.get('/search/study/:id', function (req, res) {
  const studyId = req.params.id
  const study = studiesData.find(s => s.id === studyId)

  // Fallback to search feed if ID doesn't exist
  if (!study) {
    return res.redirect('/study-search/v2/searchfeed/search-feed')
  }

  // Store the current study in session memory
  req.session.data.currentStudy = study

  // Use the folder specified in studies.json, or default to 'studydetails-1'
  const detailFolder = study.detailFolder || 'studydetails-1'

  return res.render(`study-search/v2/${detailFolder}/page-one`, { study })
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
  res.redirect('/study-search/v2/questions/question-6')
})

router.post('/questions/question-6', function (req, res) {
  res.redirect('/study-search/v2/searchfeed/search-feed')
})

module.exports = router