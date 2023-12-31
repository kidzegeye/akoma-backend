const sqlite3 = require("sqlite3");
const db = require("../../connect_db.js");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const saltRounds = 10;

function success_response(code, data) {
  return { success: true, code: code, response: data };
}

function failure_response(code, err) {
  return { success: false, code: code, response: { error: err } };
}

function err_callback(loc, err) {
  if (err) {
    console.log(`${loc} error:\n ${err}`);
    return failure_response(500, "Internal Server Error");
  }
  return false;
}

function validate_password(password, hash) {
  return bcrypt.compareSync(password, hash);
}

async function generate_session(uid) {
  const sessionToken = crypto.randomBytes(64).toString("base64");
  const expiration = Date.now() + 86400000; //1 day
  const refreshToken = crypto.randomBytes(64).toString("base64");
  return await new Promise((resolve) => {
    db.serialize(function () {
      db.run(`DELETE FROM session WHERE userID=?`, [uid], (err) => {
        err_response = err_callback("user.genSession.delete", err);
        if (err_response) resolve(err_response);
      });
      db.run(
        `INSERT INTO session (sessionToken, expiresAt, refreshToken, userID)
    VALUES (?,?,?,?)`,
        [sessionToken, expiration, refreshToken, uid],
        (err) => {
          err_response = err_callback("user.genSession", err);
          if (err_response) resolve(err_response);
          resolve(
            success_response(201, {
              sessionToken: sessionToken,
              expiration: expiration,
              refreshToken: refreshToken,
            })
          );
        }
      );
    });
  });
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
            resolve(failure_response(400, "Session Expired"));
          else if (rows && rows.expiresAt > Date.now())
            resolve(success_response(200, { response: "Validated" }));
          else resolve(failure_response(500, "Internal server error"));
        }
      }
    );
  });
}

module.exports = {
  getAll: async () => {
    return await new Promise((resolve) => {
      db.all(
        "SELECT firstName, lastName, username, email, phoneNumber, region, ghanaCardNum, businessName, industry, address FROM users",
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

  get: async (username) => {
    return await new Promise((resolve) => {
      db.get(
        `SELECT firstName, lastName, username, email, phoneNumber, region, ghanaCardNum, businessName, industry, address FROM users
       WHERE username=?`,
        [username],
        (err, data) => {
          err_response = err_callback("users.get", err);
          if (err_response) resolve(err_response);
          if (!data) resolve(failure_response(404, "User Not Found"));
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
          else if (data["COUNT(*)"] > 0) {
            resolve(failure_response(400, "User Already Exists"));
          } else {
            const session = await new Promise((resolve_inner) => {
              db.run(
                `INSERT INTO users (firstName, lastName, username, email, password, phoneNumber, region, ghanaCardNum, businessName, industry, address)
           VALUES ($firstName, $lastName, $username, $email, $password, $phoneNumber, $region, $ghanaCardNum, $businessName, $industry, $address)`,
                {
                  $firstName: body.firstName,
                  $lastName: body.lastName,
                  $username: body.username,
                  $email: body.email,
                  $password: hash,
                  $phoneNumber: body.phoneNumber,
                  $region: body.region,
                  $ghanaCardNum: body.ghanaCardNum,
                  $businessName: body.businessName,
                  $industry: body.industry,
                  $address: body.address,
                },
                async function (err, rows) {
                  err_response = err_callback("users.create ", err);
                  if (err_response) {
                    resolve_inner(err_response);
                  }
                  id = this.lastID;
                  resolve_inner(await generate_session(id));
                }
              );
            });
            if (session) {
              resolve(session);
            } else {
              resolve(failure_response(500, "Internal Server Error"));
            }
          }
        }
      );
    });
  },

  validate: async (username, password) => {
    return await new Promise((resolve) => {
      db.all(
        "SELECT id, password FROM users WHERE username=?",
        [username],
        (err, rows) => {
          err_response = err_callback("user.validate", err);
          if (err_response) resolve(err_response);
          if (rows.length != 1) {
            resolve(failure_response(400, "Login Failed"));
          } else {
            const hash = rows[0].password;
            if (validate_password(password, hash)) {
              resolve(generate_session(rows[0].id));
            } else {
              resolve(failure_response(400, "Login Failed"));
            }
          }
        }
      );
    });
  },

  refreshSession: async (username, refreshToken) => {
    return await new Promise((resolve) => {
      db.serialize(async () => {
        uid = await get_uid(username);
        if (uid == false) {
          resolve(failure_response(404, "User Not Found"));
        } else {
          db.get(
            `SELECT * FROM session WHERE userID=? AND refreshToken=?`,
            [uid, refreshToken],
            async (err, rows) => {
              err_response = err_callback("user.validateSession", err);
              if (err_response) {
                resolve(err_response);
              } else {
                if (rows) {
                  resolve(await generate_session(uid));
                } else {
                  resolve(failure_response(404, "Session Not Found"));
                }
              }
            }
          );
        }
      });
    });
  },

  logout: async (username, sessionToken) => {
    return await new Promise((resolve) => {
      db.serialize(async () => {
        uid = await get_uid(username);
        if (uid !== false) {
          validate = await validate_session(uid, sessionToken);
          if (validate.success) {
            db.run(`DELETE FROM session WHERE userID=?`, [uid], (err) => {
              err_response = err_callback("user.logout", err);
              if (err_response) resolve(err_response);
              else resolve(success_response(200, { response: "Logged Out" }));
            });
          } else {
            resolve(validate);
          }
        } else {
          resolve(failure_response(404, "User Not Found"));
        }
      });
    });
  },
  update: async (body, sessionToken) => {
    return await new Promise((resolve) => {
      db.serialize(async () => {
        uid = await get_uid(body.username);
        if (uid) {
          validate = await validate_session(uid, sessionToken);
          if (validate.success) {
            db.run(
              `UPDATE users SET 
                firstName=$firstName,
                lastName=$lastName,
                email=$email, 
                phoneNumber=$phoneNumber, 
                region=$region, 
                ghanaCardNum=$ghanaCardNum, 
                businessName=$businessName, 
                industry=$industry, 
                address=$address`,
              {
                $firstName: body.firstName,
                $lastName: body.lastName,
                $email: body.email,
                $phoneNumber: body.phoneNumber,
                $region: body.region,
                $ghanaCardNum: body.ghanaCardNum,
                $businessName: body.businessName,
                $industry: body.industry,
                $address: body.address,
              },
              (err) => {
                err_response = err_callback("user.updated", err);
                if (err_response) resolve(err_response);
                else
                  resolve(success_response(200, { response: "Updated User" }));
              }
            );
          } else {
            resolve(validate);
          }
        } else {
          resolve(failure_response(404, "User Not Found"));
        }
      });
    });
  },
  delete: async (username, sessionToken) => {
    return await new Promise((resolve) => {
      db.serialize(async () => {
        uid = await get_uid(username);
        if (uid !== false) {
          validate = await validate_session(uid, sessionToken);
          if (validate.success) {
            db.run(`DELETE FROM users WHERE id=?`, [uid], (err) => {
              err_response = err_callback("user.delete", err);
              if (err_response) resolve(err_response);
              else resolve(success_response(200, { response: "Deleted" }));
            });
          } else {
            resolve(validate);
          }
        } else {
          resolve(failure_response(404, "User Not Found"));
        }
      });
    });
  },
};
