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
  getAll: async (body, sessionToken) => {
    return await new Promise((resolve) => {
      db.serialize(async () => {
        uid = await get_uid(body.username);
        if (!uid) resolve(failure_response(404, "User Not Found"));
        else {
          validate = await validate_session(uid, sessionToken);
          if (!validate.success) resolve(validate);
          else {
            sql = `SELECT * FROM transactions JOIN transactionType on transactionType.id=transactions.id WHERE userID=? `;
            inputs = [uid];
            if (body.startDate) {
              sql += ` AND startDate>=?`;
              inputs.push(body.startDate);
            }
            if (body.endDate) {
              sql += ` AND endDate<=?`;
              inputs.push(body.endDate);
            }
            if (body.transactionType) {
              sql += ` AND transactions.transactionType=?`;
              inputs.push(body.transactionType);
            }
            db.all(sql, inputs, (err, rows) => {
              err_response = err_callback("txns.getAll", err);
              if (err_response) {
                resolve(err_response);
              } else {
                resolve(success_response(200, rows));
              }
            });
          }
        }
      });
    });
  },
  getOne: async (username, sessionToken, tid) => {
    return await new Promise((resolve) => {
      db.serialize(async () => {
        uid = await get_uid(username);
        if (!uid) resolve(failure_response(404, "User Not Found"));
        else {
          validate = await validate_session(uid, sessionToken);
          if (!validate.success) resolve(validate);
          else {
            db.get(
              `SELECT * FROM transactions JOIN transactionType on transactionType.id=transactions.id WHERE userID=? and transactions.id=?`,
              [uid, tid],
              (err, rows) => {
                err_response = err_callback("txns.getOne", err);
                if (err_response) {
                  resolve(err_response);
                } else {
                  resolve(success_response(200, rows));
                }
              }
            );
          }
        }
      });
    });
  },
  create: async (sessionToken, body) => {
    return await new Promise((resolve) => {
      db.serialize(async () => {
        uid = await get_uid(body.username);
        if (!uid) resolve(failure_response(404, "User Not Found"));
        else {
          validate = await validate_session(uid, sessionToken);
          if (!validate.success) resolve(validate);
          else {
            db.get(
              `INSERT INTO transactions (userID, startDate, endDate, transactionType, frequency, transactionName, amount, received, dueDate)
            VALUES ($userID, $startDate, $endDate, $transactionType, $frequency, $transactionName, $amount, $received, $dueDate)`,
              {
                $userID: uid,
                $startDate: body.startDate,
                $endDate: body.endDate,
                $transactionType: body.transactionType,
                $frequency: body.frequency,
                $transactionName: body.transactionName,
                $amount: body.amount,
                $received: body.received,
                $dueDate: body["dueDate"],
              },
              (err) => {
                err_response = err_callback("txns.create", err);
                if (err_response) {
                  resolve(err_response);
                } else {
                  resolve(success_response(201, "Transaction Added"));
                }
              }
            );
          }
        }
      });
    });
  },
  edit: async (sessionToken, body) => {
    return await new Promise((resolve) => {
      db.serialize(async () => {
        uid = await get_uid(body.username);
        if (!uid) resolve(failure_response(404, "User Not Found"));
        else {
          validate = await validate_session(uid, sessionToken);
          if (!validate.success) resolve(validate);
          else {
            db.get(
              `UPDATE transactions SET
            userID=$userID,
            startDate=$startDate,
            endDate=$endDate,
            transactionType=$transactionType, 
            frequency=$frequency, 
            transactionName=$transactionName, 
            amount=$amount, 
            received=$received, 
            dueDate=$dueDate
            WHERE id=$tid`,
              {
                $userID: uid,
                $startDate: body.startDate,
                $endDate: body.endDate,
                $transactionType: body.transactionType,
                $frequency: body.frequency,
                $transactionName: body.transactionName,
                $amount: body.amount,
                $received: body.received,
                $dueDate: body["dueDate"],
                $tid: body.tid,
              },
              (err) => {
                err_response = err_callback("txns.update", err);
                if (err_response) {
                  resolve(err_response);
                } else {
                  resolve(success_response(200, "Transaction Updated"));
                }
              }
            );
          }
        }
      });
    });
  },
};
