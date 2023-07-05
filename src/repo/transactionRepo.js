const sqlite3 = require("sqlite3");
const db = require("../../connect_db.js");
function success_response(code, data) {
  return { success: true, code: code, response: data };
}

function failure_response(code, err) {
  return { success: false, code: code, response: err };
}

function err_callback(loc, err) {
  if (err) {
    console.log(`${loc} error:\n ${err}`);
    return failure_response(500, "Internal server error");
  }
  return false;
}

async function get_uid(username) {
  return await new Promise((resolve_inner) => {
    db.get(`SELECT id FROM users WHERE username=?`, [username], (err, row) => {
      err_response = err_callback("user.validateSession", err);
      if (err_response || !row) {
        resolve_inner(false);
      } else {
        resolve_inner(row.id);
      }
    });
  });
}

async function validate_session(uid, sessionToken) {
  return await new Promise((resolve) => {
    db.get(
      `SELECT * FROM session WHERE userID=? AND sessionToken=? ORDER BY expiresAt DESC`,
      [uid, sessionToken],
      (err, rows) => {
        err_response = err_callback("user.validateSession", err);
        if (err_response) {
          resolve(err_response);
        } else {
          if (!rows) resolve(failure_response(404, "Session not found"));
          else if (rows.expiresAt <= Date.now())
            resolve(failure_response(400, "Session expired"));
          else if (rows && rows.expiresAt > Date.now())
            resolve(success_response(200, "Validated"));
          else resolve(failure_response(500, "Internal server error"));
        }
      }
    );
  });
}

module.exports = {
  getAll: async (uid) => {
    return await new Promise((resolve) => {
      db.serialize();
    });
  },
};
