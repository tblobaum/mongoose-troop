

function emptyToSparse(str) {
  return (!str || !str.length) ? undefined : str
}

function validatePresenceOf(value) {
  return value && value.length
}

module.exports = {
  emptyToSparse: emptyToSparse
, validatePresenceOf: validatePresenceOf
}
