const db = require("../database/db");

/**
 * Save or update a preference.
 *
 * Current database schema:
 * preferences
 * - id
 * - key
 * - value
 * - updated_at
 */
function savePreference(key, value) {
  if (!key || !value) {
    throw new Error("Preference key and value are required.");
  }

  const existing = db
    .prepare("SELECT id FROM preferences WHERE key = ?")
    .get(key);

  if (existing) {
    db.prepare(`
      UPDATE preferences
      SET value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE key = ?
    `).run(value, key);

    return {
      success: true,
      action: "updated",
      key,
      value,
    };
  }

  db.prepare(`
    INSERT INTO preferences (key, value)
    VALUES (?, ?)
  `).run(key, value);

  return {
    success: true,
    action: "saved",
    key,
    value,
  };
}

/**
 * Get one preference.
 */
function getPreference(key) {
  if (!key) {
    throw new Error("Preference key is required.");
  }

  const result = db
    .prepare(`
      SELECT key, value, updated_at
      FROM preferences
      WHERE key = ?
    `)
    .get(key);

  if (!result) {
    return {
      success: true,
      key,
      value: null,
    };
  }

  return {
    success: true,
    ...result,
  };
}

/**
 * Get all saved preferences.
 */
function getPreferences() {
  const results = db
    .prepare(`
      SELECT key, value, updated_at
      FROM preferences
      ORDER BY key
    `)
    .all();

  return {
    success: true,
    preferences: results,
  };
}

module.exports = {
  savePreference,
  getPreference,
  getPreferences,
};