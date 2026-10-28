const express = require('express')
const router = express.Router()

const healthConditionsData = require('../../../data/health-conditions.json')
// Made-up study counts for the prototype (same name always gives the same number)
function fakeCount (text) {
  let n = 0
  for (let i = 0; i < text.length; i++) {
    n = (n * 31 + text.charCodeAt(i)) % 997
  }
  return (n % 150) + 3
}

// Attach a made-up count to every area and condition
Object.values(healthConditionsData).forEach(function (cat) {
  cat.count = fakeCount(cat.text)
  ;(cat.items || []).forEach(function (item) {
    item.count = fakeCount(item.text)
  })
})


// Tells the shared layout that these pages are v4
router.use(function (req, res, next) {
  res.locals.studySearchVersion = 'v4'
  next()
})

// Load the dummy studies from app/data/studies.json
const studiesData = require('../../../data/studies.json')

// Number of studies shown per page
const PAGE_SIZE = 10

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

// Builds the data object for the NHS pagination component
function buildPagination (currentPage, totalPages, baseUrl) {
  if (totalPages <= 1) return null

  const pageHref = n => `${baseUrl}?page=${n}`
  const pages = new Set([1, totalPages])
  for (let n = currentPage - 2; n <= currentPage + 2; n++) {
    if (n >= 1 && n <= totalPages) pages.add(n)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const items = []
  let last = 0

  sorted.forEach(n => {
    if (n - last === 2) {
      items.push({ number: last + 1, href: pageHref(last + 1) })
    } else if (n - last > 2) {
      items.push({ ellipsis: true })
    }
    items.push({ number: n, href: pageHref(n), current: n === currentPage })
    last = n
  })

  const pagination = { items }
  if (currentPage > 1) pagination.previous = { href: pageHref(currentPage - 1) }
  if (currentPage < totalPages) pagination.next = { href: pageHref(currentPage + 1) }
  return pagination
}

// Applies keywords, location, status, condition, sub-condition, sex, AND sorting filters to the study list.
function applyFilters(studies, { keywords, location, activeStatuses, selectedConditions, subCondition, sex, sortBy, ageRange }) {
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

  // 6. Age Range Filter
  if (ageRange && ageRange.length > 0) {
    const categoryRanges = {
      infant: { min: 0, max: 2 },
      child: { min: 3, max: 12 },
      adolescent: { min: 13, max: 17 },
      adult: { min: 18, max: null }
    }

    results = results.filter(study => {
      const studyMin = study.ageMin === null || study.ageMin === undefined ? 0 : study.ageMin
      const studyMax = study.ageMax === null || study.ageMax === undefined ? Infinity : study.ageMax

      return ageRange.some(function (category) {
        const range = categoryRanges[category]
        if (!range) return false
        const catMax = range.max === null ? Infinity : range.max
        // Overlap check: study range and category range intersect
        return studyMin <= catMax && studyMax >= range.min
      })
    })
  }

  // 7. Sex/Gender Filter
  if (sex) {
    results = results.filter(study => {
      if (!study.targetSex || study.targetSex === 'all') return true
      return study.targetSex.toLowerCase() === sex.toLowerCase()
    })
  }

  // 7. Sorting Logic
  if (sortBy === 'a-z') {
    results.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')))
  } else {
    results.sort((a, b) => Number(b.id) - Number(a.id))
  }

  return results
}

// ROUTE HANDLER: Handles search feed, dynamic filters, autocomplete searches, sorting & pagination
router.all('/searchfeed/search-feed', function (req, res) {
  if (!req.session.data) {
    req.session.data = {}
  }

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

    return res.redirect('/study-search/v4/searchfeed/search-feed')
  }

  const inputSource = req.method === 'POST' ? req.body : req.query
  const sd = req.session.data

  try {
    const refererUrl = new URL(req.headers.referer || '', `${req.protocol}://${req.get('host')}`)
    const sameOrigin = refererUrl.host === req.get('host')
    const fromDashboard = refererUrl.pathname.startsWith('/dashboard/')
    const fromThisSearchFeed = refererUrl.pathname.startsWith('/study-search/v4/searchfeed/')

    if (sameOrigin && fromDashboard && !fromThisSearchFeed) {
      sd.dashboard_return_url = refererUrl.pathname + refererUrl.search
    }
  } catch (err) {
  }

  sd.from_dashboard = inputSource.from_dashboard === 'true'

  // Sanitize incoming input overrides
  if (inputSource.keywords !== undefined) sd.keywords = sanitizeInput(inputSource.keywords)
  if (inputSource.sex !== undefined) {
    sd.sex = sanitizeInput(inputSource.sex)
  } else if (req.method === 'POST') {
    sd.sex = ''
  }
  if (inputSource.locationPreference !== undefined) {
    sd.locationPreference = sanitizeInput(inputSource.locationPreference)
  } else if (req.method === 'POST') {
    sd.locationPreference = ''
  }
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
    : (req.method === 'POST' ? [] : (sd.activeStatuses || []))

  const activeStatuses = sanitizeInput(rawStatuses)
  sd.activeStatuses = activeStatuses


  // Age range filter sanitization
  let rawAgeRange = inputSource.ageRange !== undefined
    ? (Array.isArray(inputSource.ageRange) ? inputSource.ageRange : [inputSource.ageRange])
    : (req.method === 'POST' ? [] : (sd.ageRange || []))

  const ageRange = sanitizeInput(rawAgeRange)
  sd.ageRange = ageRange

  // Build the primary health condition dropdown list
  const healthConditionItems = [
    { value: "", text: "Choose area" }
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
  const filteredStudies = applyFilters(studies, {
    keywords,
    location,
    activeStatuses,
    selectedConditions,
    subCondition: chosenSubCondition,
    sex: chosenSex,
    sortBy: chosenSortBy,
    ageRange
  })

  // Pagination
  // POSTs (filters or sort) have no ?page, so they go back to page 1
  const baseUrl = '/study-search/v4/searchfeed/search-feed'
  const requestedPage = parseInt(req.query.page, 10) || 1
  const totalPages = Math.max(1, Math.ceil(filteredStudies.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const results = filteredStudies.slice(start, start + PAGE_SIZE)

  res.render('study-search/v4/searchfeed/search-feed', {
    results,
    resultsCount: filteredStudies.length,
    resultsStart: start + 1,
    resultsEnd: start + results.length,
    paginationData: buildPagination(currentPage, totalPages, baseUrl),
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

// Save a study from the search results into the saved studies list
router.post('/save-study', function (req, res) {
  if (!req.session.data.savedStudies) {
    req.session.data.savedStudies = []
  }

  const studyId = sanitizeInput(req.body.studyId)
  const studyTitle = sanitizeInput(req.body.studyTitle)

  if (studyTitle && req.session.data.savedStudies.indexOf(studyTitle) === -1) {
    req.session.data.savedStudies.push(studyTitle)
  }

  const fromDashboard = req.body.from_dashboard === 'true' || req.session.data.from_dashboard === true

  res.redirect(`/study-search/v4/searchfeed/search-feed?saved_study_id=${encodeURIComponent(studyId)}&from_dashboard=${fromDashboard}`)
})

function removeStudyHandler (req, res) {
  const inputSource = req.method === 'POST' ? req.body : req.query
  const studyId = sanitizeInput(inputSource.studyId)

  const study = studiesData.find(s => s.id === studyId)
  const studyTitle = study ? study.title : null

  if (studyTitle && req.session.data.savedStudies) {
    const index = req.session.data.savedStudies.indexOf(studyTitle)
    if (index !== -1) {
      req.session.data.savedStudies.splice(index, 1)
    }
  }

  const fromDashboard = inputSource.from_dashboard === 'true' || req.session.data.from_dashboard === true

  res.redirect(`/study-search/v4/searchfeed/search-feed?removed_study_id=${encodeURIComponent(studyId)}&from_dashboard=${fromDashboard}`)
}

router.get('/remove-study', removeStudyHandler)
router.post('/remove-study', removeStudyHandler)

// Study detail page
router.get('/search/study/:id', function (req, res) {
  const studyId = req.params.id
  const study = studiesData.find(s => s.id === studyId)

  if (!study) {
    return res.redirect('/study-search/v4/searchfeed/search-feed')
  }

  req.session.data.currentStudy = study
  const detailFolder = study.detailFolder || 'studydetails-1'

  // Redirecting updates the URL bar so relative links resolve correctly
  return res.redirect(`/study-search/v4/${detailFolder}/page-1`)
})

// ****************************************
// Onboarding Questions 1–4 & Question 6
// ****************************************

// Question 1: Sex / Gender
router.post('/questions/question-1', function (req, res) {
  const cleanSex = sanitizeInput(req.body.sex)
  const cleanGender = sanitizeInput(req.body.genderSameAsSex)

  req.session.data.sex = cleanSex
  req.session.data.genderSameAsSex = cleanGender

  const errors = {}
  const errorList = []

  if (!cleanSex) {
    errors.sex = { text: 'Select your sex registered at birth' }
    errorList.push({ text: errors.sex.text, href: '#sex-1' })
  }

  if (!cleanGender) {
    errors.genderSameAsSex = { text: 'Select if the gender you identify with is the same as your sex registered at birth' }
    errorList.push({ text: errors.genderSameAsSex.text, href: '#gender-same-as-sex-1' })
  }

  if (errorList.length) {
    return res.render('study-search/v4/questions/question-1', { errors, errorList })
  }

  res.redirect('/study-search/v4/questions/question-2')
})

// Question 2: Date of birth
router.post('/questions/question-2', function (req, res) {
  const dob = req.body.dateofbirth || {}
  const day = sanitizeInput(dob.day)
  const month = sanitizeInput(dob.month)
  const year = sanitizeInput(dob.year)

  req.session.data.dateofbirthDay = day
  req.session.data.dateofbirthMonth = month
  req.session.data.dateofbirthYear = year

  // Always keep as an object so auto-store-data middleware doesn't crash
  req.session.data.dateofbirth = {
    day: day || '',
    month: month || '',
    year: year || ''
  }

  const errors = {}
  let message = ''

  if (!day && !month && !year) {
    message = 'Enter your date of birth'
    errors.day = errors.month = errors.year = true
  } else if (!day || !month || !year) {
    const missing = []
    if (!day) { missing.push('day'); errors.day = true }
    if (!month) { missing.push('month'); errors.month = true }
    if (!year) { missing.push('year'); errors.year = true }
    message = 'Date of birth must include a ' + missing.join(' and ')
  } else {
    const d = parseInt(day, 10)
    const m = parseInt(month, 10)
    const y = parseInt(year, 10)
    const date = new Date(y, m - 1, d)
    const isReal = year.length === 4 &&
      date.getFullYear() === y &&
      date.getMonth() === m - 1 &&
      date.getDate() === d

    if (!isReal) {
      message = 'Date of birth must be a real date'
      errors.day = errors.month = errors.year = true
    } else if (date > new Date()) {
      message = 'Date of birth must be in the past'
      errors.day = errors.month = errors.year = true
    }
  }

  if (message) {
    errors.dob = { text: message }
    const firstField = errors.day ? 'day' : errors.month ? 'month' : 'year'
    const errorList = [{ text: message, href: '#date-of-birth-' + firstField }]
    return res.render('study-search/v4/questions/question-2', { errors, errorList })
  }

  res.redirect('/study-search/v4/questions/question-3')
})

// Question 3: Health Conditions
router.get('/questions/question-3', function (req, res) {
  res.render('study-search/v4/questions/question-3', {
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

  res.redirect('/study-search/v4/questions/question-4')
})

// Question 4: Location Preference
router.post('/questions/question-4', function (req, res) {
  const pref = sanitizeInput(req.body.locationPreference)

    if (pref === 'specific-area' && !sanitizeInput(req.body.location)) {
    req.session.data.locationPreference = 'specific-area'
    return res.render('study-search/v4/questions/question-4', { locationError: true })
  }

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

  res.redirect('/study-search/v4/questions/question-6')
})

// Question 6: Confirmation
router.get('/questions/question-6', function (req, res) {
  const sd = req.session.data || {}

  const location = sd.locationPreference === 'specific-area' ? (sd.location || '') : ''

  const selectedConditions = Array.isArray(sd.healthConditions)
    ? sd.healthConditions.filter(c => healthConditionsData[c])
    : []

  const matchedStudies = applyFilters(studiesData, {
    keywords: '',
    location,
    activeStatuses: [],
    selectedConditions,
    subCondition: '',
    sex: sd.sex || '',
    sortBy: 'most-recent',
    ageRange: []
  })

  if (matchedStudies.length > 0) {
    return res.render('study-search/v4/questions/question-6')
  }

  return res.render('study-search/v4/questions/question-6-no-results')
})

router.post('/questions/question-6', function (req, res) {
  res.redirect('/study-search/v4/searchfeed/search-feed')
})

module.exports = router