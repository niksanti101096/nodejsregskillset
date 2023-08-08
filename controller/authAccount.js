// Database connection is established here at Controller

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const e = require("express");
const mysql = require("mysql2");
const db = mysql.createConnection({
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Register Function
exports.register = (req, res) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;

  db.query(
    "SELECT email FROM accounts WHERE email = ?",
    email,
    async (err, results) => {
      if (results.length > 0) {
        res.render("register", {
          message: "Email already existed!",
          color: "alert-danger",
        });
      } else if (password !== confirm_password) {
        res.render("register", {
          message: "Password and Confirm Password does not matched!",
          color: "alert-danger",
        });
      }
      // Hashing the password
      const hashPassword = await bcrypt.hash(password, 8);

      db.query(
        "INSERT INTO accounts SET ?",
        {
          first_name: first_name,
          last_name: last_name,
          email: email,
          password: hashPassword,
        },
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            res.render("register", {
              message: "Successfully registered!",
              color: "alert-success",
            });
          }
        }
      );
    }
  );
};

// Login Function
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    // If email or password is empty
    if (email === "" || password === "") {
      res.render("index", {
        message: "Email and password should not be empty!",
      });
    }
    // If email or password is not empty
    else {
      db.query(
        "SELECT * FROM accounts WHERE email = ?",
        email,
        async (err, results) => {
          // If email is not existing
          if (!results) {
            res.render("index", {
              message: "The email does not exist!",
              color: "alert-danger",
            });
          }
          // If password is incorrect
          else if (!(await bcrypt.compare(password, results[0].password))) {
            res.render("index", {
              message: "Password is incorrect!",
              color: "alert-danger",
            });
          }
          // Successfull login and display all the accounts in the database
          else {
            const account_id = results[0].account_id;
            const token = jwt.sign({ account_id }, process.env.JWTSECRET, {
              expiresIn: process.env.JWTEXPIRES,
            });
            const cookieoption = {
              expires: new Date(
                Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000
              ),
              httpOnly: true,
            };
            res.cookie("JTW", token, cookieoption);

            db.query("SELECT * FROM accounts", (err, results) => {
              res.render("listaccounts", {
                title: "List of Users",
                accounts: results,
              });
            });
          }
        }
      );
    }
  } catch (err) {
    console.log(`Catched error: ${err}`);
  }
};

// Population Update Function
exports.updateform = (req, res) => {
  const email = req.params.email;
  db.query("SELECT * FROM accounts WHERE email = ?", email, (err, result) => {
    res.render("updateform", { result: result[0] });
  });
};

// Modifying Update Function
exports.updateuser = (req, res) => {
  const { first_name, last_name, email } = req.body;

  if (first_name === "" || last_name === "") {
    res.render("updateform", {
      message: "First name and last name should not be empty!",
      color: "alert-danger",
      result: { first_name: first_name, last_name: last_name, email: email },
    });
  } else {
    db.query(
      `UPDATE accounts SET first_name = "${first_name}", last_name = "${last_name}" WHERE email = "${email}"`,
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          db.query("SELECT * FROM accounts", (err, results) => {
            res.render("listaccounts", {
              title: "List of Users",
              accounts: results,
              message: "Successfully updated the account",
              color: "alert-success",
            });
          });
        }
      }
    );
  }
};

exports.deleteusernotif = (req, res) => {
  const email = req.params.email;
  db.query(`DELETE FROM accounts WHERE email = "${email}"`, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      db.query("SELECT * FROM accounts", (err, results) => {
        res.render("listaccounts", {
          title: "List of Users",
          accounts: results,
          message: "Successfully deleted the account",
          color: "alert-success",
        });
      });
    }
  });
};

exports.logout = (req, res) => {
  // if (req.session) {
  //   req.session.destroy((err) => {
  //     if (err) {
  //       res.status(400).send("Unable to logout");
  //     } else {
  //       res.clear
  //         .cookie("JWT")
  //         .status(200)
  //         .json({ message: "Successfully logged out" });
  //       res.render("index");
  //     }
  //   });
  // } else {
  //   console.log("No Sessions found!");
  //   res.end();
  // }
  res.clearCookie("JWT").status(200);
  res.render("index", {
    message: "Succesfully logout!",
    color: "alert-success",
  });
};

exports.skillset = (req, res) => {
  const email = req.params.email;
  db.query(
    `SELECT s.title, a.email, s.level,
    CASE
      WHEN s.level = "Advance" THEN 100
        WHEN s.level = "Intermediate" THEN 66.66666666666667
        WHEN s.level = "Needs training" THEN 33.33333333333333
    END AS level_percentage
    FROM skillset AS s
    JOIN accounts AS a
    ON s.account_id = a.account_id
    WHERE a.email = "${email}"`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result.length === 0) {
        res.render("skillset", {
          message: "No skillset found!",
          email: email,
          color: "alert-danger",
        });
      } else {
        res.render("skillset", { skillsets: result, email: email });
      }
    }
  );
};

exports.gobacklistaccounts = (req, res) => {
  db.query("SELECT * FROM accounts", (err, results) => {
    res.render("listaccounts", {
      title: "List of Users",
      accounts: results,
    });
  });
};
