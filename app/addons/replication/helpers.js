
function getDatabaseLabel (db) {
  let dbString = (_.isString(db)) ? db.trim().replace(/\/$/, '') : db.url;
  const matches = dbString.match(/[^\/]+$/, '');
  return matches[0];
}

export default {
  getDatabaseLabel
};
