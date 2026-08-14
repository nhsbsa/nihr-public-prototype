const express = require('express')
const router = express.Router()

// Load health conditions JSON data from app/data/
const healthConditionsData = require('../../../data/health-conditions.json')

// Load the dummy studies from app/data/studies.json
const studiesData = require('../../../data/studies.json')

// Helper function to sanitize input strings and arrays against empty or '_unchecked' values
function sanitizeInput(val) {
  if (Array.isArray(val)) {
    return val.filter(item => item && String(item).trim() !== '' && item !== '_unchecked')
  }
  if (!val || val === '_unchecked' || String(val).trim() === '') {
    return ''
  }
  return String(val).trim()
}

// Applies keywords, location, status, condition, sub-condition, sex, AND sorting filters to the study list.
function applyFilters(studies, { keywords, location, activeStatuses, selectedConditions, subCondition, sex, sortBy }) {
  let results = [...studies]

  // 1. Keyword Filter
  if (keywords) {
    results = results.filter(study => study.title.toLowerCase().includes(keywords.toLowerCase()))
  }

  // 2. Location Filter
  if (location) {
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

  // 5. Specific Sub-Condition Filter
  if (subCondition && subCondition !== 'all') {
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

  // 6. Sex/Gender Filter
  if (sex) {
    results = results.filter(study => {
      if (!study.targetSex || study.targetSex === 'all') return true
      return study.targetSex.toLowerCase() === sex.toLowerCase()
    })
  }

  // 7. Sorting Logic
  if (sortBy === 'a-z') {
    results.sort((a, b) => a.title.localeCompare(b.title))
  } else {
    results.sort((a, b) => Number(b.id) - Number(a.id))
  }

  return results
}

// ROUTE HANDLER: Handles search feed, dynamic filters, autocomplete searches & sorting
router.all('/searchfeed/search-feed', function (req, res) {
  if (!req.session.data) {
    req.session.data = {}
  }

  // Clear filters feature
  // Clear filters feature
  if (req.query.clear === 'true') {
    req.session.data.keywords = ''
    req.session.data.sex = ''
    req.session.data.locationPreference = ''
    req.session.data.location = ''
    req.session.data.travelDistance = ''
    req.session.data.healthCondition = ''
    req.session.data.subCondition = ''
    req.session.data.healthConditions = []
    req.session.data.activeStatuses = []
    req.session.data.ageRange = []
    req.session.data.dateofbirth = { day: '', month: '', year: '' }
    
    return res.redirect('/study-search/v2/searchfeed/search-feed')
  }

  const inputSource = req.method === 'POST' ? req.body : req.query
  const sd = req.session.data

  // Sanitize incoming input overrides
  if (inputSource.keywords !== undefined) sd.keywords = sanitizeInput(inputSource.keywords)
  if (inputSource.sex !== undefined) sd.sex = sanitizeInput(inputSource.sex)
  if (inputSource.locationPreference !== undefined) sd.locationPreference = sanitizeInput(inputSource.locationPreference)
  if (inputSource.healthCondition !== undefined) sd.healthCondition = sanitizeInput(inputSource.healthCondition)
  if (inputSource.subCondition !== undefined) sd.subCondition = sanitizeInput(inputSource.subCondition)
  if (inputSource.sortBy !== undefined) sd.sortBy = sanitizeInput(inputSource.sortBy)

  // Location logic
  let location = ""
  if (sd.locationPreference === 'specific-area') {
    if (inputSource.location !== undefined) sd.location = sanitizeInput(inputSource.location)
    location = sd.location || ""
  } else {
    sd.location = ""
  }

  // Validate Health Condition choice against valid categories
  let chosenCondition = sd.healthCondition || ''
  if (!healthConditionsData[chosenCondition]) {
    chosenCondition = ''
  }

  // Fallback to Question 3 selection if search feed selection is empty
  if (!chosenCondition && Array.isArray(sd.healthConditions) && sd.healthConditions.length > 0) {
    const validCond = sd.healthConditions.find(c => healthConditionsData[c])
    chosenCondition = validCond || ''
  }

  const chosenSubCondition = sd.subCondition || ''
  const chosenSortBy = sd.sortBy || 'most-recent'
  const chosenSex = sd.sex || ''
  const keywords = sd.keywords || ''

  const selectedConditions = chosenCondition && chosenCondition !== '_all' ? [chosenCondition] : []

  // Status Filter Sanitization
  let rawStatuses = inputSource.status !== undefined
    ? (Array.isArray(inputSource.status) ? inputSource.status : [inputSource.status])
    : (sd.activeStatuses || [])

  const activeStatuses = sanitizeInput(rawStatuses)
  sd.activeStatuses = activeStatuses

  // Build the primary health condition dropdown list
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

  // Run unified filtering
  const results = applyFilters(studies, {
    keywords,
    location,
    activeStatuses,
    selectedConditions,
    subCondition: chosenSubCondition,
    sex: chosenSex,
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
    allStudies: studies,
    data: sd
  })
})

router.get('/search/study/:id', function (req, res) {
  const studyId = req.params.id
  const study = studiesData.find(s => s.id === studyId)

  if (!study) {
    return res.redirect('/study-search/v2/searchfeed/search-feed')
  }

  req.session.data.currentStudy = study
  const detailFolder = study.detailFolder || 'studydetails-1'

  // Redirecting updates the URL bar so relative links resolve correctly
  return res.redirect(`/study-search/v2/${detailFolder}/page-one`)
})
// ****************************************
// Onboarding Questions 1–4 & Question 6
// ****************************************

// Question 1: Sex / Gender
router.post('/questions/question-1', function (req, res) {
  const cleanSex = sanitizeInput(req.body.sex)
  req.session.data.sex = cleanSex
  req.session.data.genderSameAsSex = sanitizeInput(req.body.genderSameAsSex)

  res.redirect('/study-search/v2/questions/question-2')
})

// Question 2: Date of birth
router.post('/questions/question-2', function (req, res) {
  const day = sanitizeInput(req.body['dateofbirth-day'])
  const month = sanitizeInput(req.body['dateofbirth-month'])
  const year = sanitizeInput(req.body['dateofbirth-year'])

  req.session.data.dateofbirthDay = day
  req.session.data.dateofbirthMonth = month
  req.session.data.dateofbirthYear = year

  // Always keep as an object so auto-store-data middleware doesn't crash
  req.session.data.dateofbirth = {
    day: day || '',
    month: month || '',
    year: year || ''
  }

  res.redirect('/study-search/v2/questions/question-3')
})

// Question 3: Health Conditions
router.get('/questions/question-3', function (req, res) {
  res.render('study-search/v2/questions/question-3', {
    healthConditionsData: healthConditionsData
  })
})

router.post('/questions/question-3', function (req, res) {
  let rawConditions = req.body.healthConditions
  if (rawConditions && !Array.isArray(rawConditions)) {
    rawConditions = [rawConditions]
  }

  const cleanConditions = sanitizeInput(rawConditions || [])
  req.session.data.healthConditions = cleanConditions

  // Assign initial condition if valid
  if (cleanConditions.length > 0 && healthConditionsData[cleanConditions[0]]) {
    req.session.data.healthCondition = cleanConditions[0]
  } else {
    req.session.data.healthCondition = ''
  }

  res.redirect('/study-search/v2/questions/question-4')
})

// Question 4: Location Preference
router.post('/questions/question-4', function (req, res) {
  const pref = sanitizeInput(req.body.locationPreference)

  if (pref === 'specific-area' && sanitizeInput(req.body.location)) {
    req.session.data.locationPreference = 'specific-area'
    req.session.data.location = sanitizeInput(req.body.location)
    req.session.data.travelDistance = sanitizeInput(req.body.travelDistance) || '25'
  } else if (pref === 'anywhere-in-uk') {
    req.session.data.locationPreference = 'anywhere-in-uk'
    req.session.data.location = ''
    req.session.data.travelDistance = ''
  } else {
    // If skipped or empty, leave unselected
    req.session.data.locationPreference = ''
    req.session.data.location = ''
    req.session.data.travelDistance = ''
  }

  res.redirect('/study-search/v2/questions/question-6')
})

// Question 6: Confirmation
router.get('/questions/question-6', function (req, res) {
  res.render('study-search/v2/questions/question-6')
})

router.post('/questions/question-6', function (req, res) {
  res.redirect('/study-search/v2/searchfeed/search-feed')
})

module.exports = router