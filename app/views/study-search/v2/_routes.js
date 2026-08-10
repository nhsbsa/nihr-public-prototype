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

router.all('/study-search/v1/search-results', function (req, res) {
  if (req.query.clear === 'true') {
    req.session.data = {}
    res.locals.data = {}
  }

  const inputSource = req.method === 'POST' ? req.body : req.query
  const { keywords, status } = inputSource

  const sd = req.session.data || {}
  const location = inputSource.location || sd.location
  const hasSubConditions = Object.keys(sd).some(key => key.endsWith('Sub') && Array.isArray(sd[key]) && sd[key].length > 0)

  const selectedConditions = updateSelectedConditions(req.session,