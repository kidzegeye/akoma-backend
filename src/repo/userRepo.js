const sqlite3 = require("sqlite3");
const db = require("../../connect_db.js");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const saltRounds = 10;

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

function validate_password(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function validate_session(uid, session_token) {
  db.get(
    "SELECT * FROM session where id=? and session_token=? ORDER BY expiresAt",
    [uid, session_token],
    function (err, rows) {
      if (!err_callback("validate_session", err)) {
        if (rows[0].expiresAt < Date.now) {
        }
      }
    }
  );
}

async function renew_session(uid) {
  const session_token = crypto.randomBytes(64).toString("base64");
  const expiration = Date.now() + 86400000; //1 day
  const update_token = crypto.randomBytes(64).toString("base64");
  return await new Promise((resolve) => {
    db.serialize(function () {
      db.run(`DELETE FROM session WHERE userID=?`, [uid], (err) => {
        err_response = err_callback("user.renew.delete", err);
        if (err_response) resolve(err_response);
      });
      db.run(
        `INSERT INTO session (sessionToken, expiresAt, refreshToken, userID)
    VALUES (?,?,?,?)`,
        [session_token, expiration, update_token, uid],
        (err) => {
          err_response = err_callback("user.renewSession", err);
          if (err_response) resolve(err_response);
          resolve(
            success_response(201, {
              session_token: session_token,
              expiration: expiration,
              update_token: update_token,
            })
          );
        }
      );
    });
  });
}

module.exports = {
  getAll: async () => {
    return await new Promise((resolve) => {
      db.all(
        "SELECT firstName, lastName, username, email, phoneNumber, region, gid, businessName, industry, address FROM users",
        (err, data) => {
          err_response = err_callback("users.getAll", err);
          if (!err_response) {
            resolve(success_response(200, data));
          }
          resolve(err_response);
        }
      );
    }).then((data) => {
      return data;
    });
  },

  get: async (id) => {
    return await new Promise((resolve) => {
      db.get(
        `SELECT firstName, lastName, username, email, phoneNumber, region, gid, businessName, industry, address FROM users
       WHERE id=?`,
        [id],
        (err, data) => {
          err_response = err_callback("users.get", err);
          if (err_response) resolve(err_response);
          if (!data) resolve(failure_response(404, "User not found"));
          resolve(success_response(200, data));
        }
      );
    }).then((data) => {
      return data;
    });
  },

  create: async (body) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(body.password, salt);

    return await new Promise((resolve) => {
      db.get(
        "SELECT COUNT(*) FROM users WHERE username=?",
        [body.username],
        async (err, data) => {
          err_response = err_callback("user.create", err);
          if (err_response) resolve(err_response);
          if (data["COUNT(*)"] > 0) {
            resolve(failure_response(400, "User already Exists"));
          }
          const session = await new Promise((resolve_inner) => {
            db.run(
              `INSERT INTO users (firstName, lastName, username, email, password, phoneNumber, region, gid, businessName, industry, address)
         VALUES ($firstName, $lastName, $username, $email, $password, $phoneNumber, $region, $gid, $business, $industry, $address)`,
              {
                $firstName: body.firstName,
                $lastName: body.lastName,
                $username: body.username,
                $email: body.email,
                $password: hash,
                $phoneNumber: body.phoneNumber,
                $region: body.region,
                $gid: body.gid,
                $business: body.business,
                $industry: body.industry,
                $address: body.address,
              },
              async function (err) {
                err_response = err_callback("users.create ", err);
                if (err_response) {
                  resolve_inner(err_response);
                }
                id = this.lastID;
                resolve_inner(await renew_session(id));
              }
            );
          });
          if (session) {
            resolve(session);
          } else {
            resolve(failure_response(500, "Internal server error"));
          }
        }
      );
    });
  },

  validate: async (body) => {
    return await new Promise((resolve) => {
      db.all(
        "SELECT id, password FROM users WHERE username=?",
        [body.username],
        (err, rows) => {
          err_response = err_callback("user.validate", err);
          if (err_response) resolve(err_response);
          if (rows.length != 1) {
            resolve(failure_response(400, "Failed login"));
          } else {
            const hash = rows[0].password;
            if (validate_password(body.password, hash)) {
              resolve(renew_session(rows[0].id));
            } else {
              resolve(failure_response(400, "Failed login"));
            }
          }
        }
      );
    });
  },
};
