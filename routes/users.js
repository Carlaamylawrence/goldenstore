const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const con = require("../lib/db_connection");
const jwt = require('jsonwebtoken')
const middleware = require("../middleware/auth");
require("dotenv").config();

// Gets all users
router.get("/", (req, res) => {
  try {
    con.query("SELECT * FROM users", (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

// Gets one user
router.get("/:id", (req, res) => {
  try {
    con.query(`SELECT * FROM users WHERE id = ${req.params.id}`, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
    // res.send({ id: req.params.id });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// Add new users
router.post("/", (req, res) => {
  // the below allows you to only need one const, but every input required is inside of the brackets
  const { fullname, email, password, userRole, phone, created, cart } =
    req.body;
  // OR
  // the below requires you to add everything one by one
  //   const email = req.body.email;
  try {
    con.query(
      //When using the ${}, the content of con.query MUST be in the back tick
      `INSERT INTO users (fullname,
        email,
        password,
        userRole,
        phone,
        created,
        cart) values ("${fullname}","${email}","${password}","${userRole}","${phone}","${created}","${cart}")`,
      (err, result) => {
        if (err) throw err;
        res.send("user successfully created");
      }
    );
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// Delete one users
router.delete("/:id", (req, res) => {
    try {
      con.query(`DELETE FROM users WHERE id = ${req.params.id}`, (err, result) => {
        if (err) throw err;
        res.send("Sucessfully deleted this user");
      });
      // res.send({ id: req.params.id });
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  });

//Update users
  router.patch("/:id", middleware, (req, res) => {
    // the below allows you to only need one const, but every input required is inside of the brackets
    const { fullname, email, password, userRole, phone, created, cart } =
    req.body;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    // OR
    // the below requires you to add everything one by one
    //   const email = req.body.email;
    try {
      con.query(
        //When using the ${}, the content of con.query MUST be in the back tick
        `UPDATE users SET fullname="${fullname}", email="${email}", password="${hash}", userRole="${userRole}",  phone="${phone}", created="${created}", cart="${cart}" WHERE id= "${req.params.id}"`,
        (err, result) => {
          if (err) throw err;
          res.send("user successfully updated");
        }
      );
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  });

  router.post("/register", (req, res) => {
    try {
      let sql = "INSERT INTO users SET ?";
      const { fullname, email, password, userRole, phone, created, cart } =
    req.body;
   
      // The start of hashing / encryption
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
  
      let user = {
        fullname,
        email,
        // We sending the hash value to be stored witin the table
        password:hash,
        phone,
        created,
        userRole,
        cart,
      };
      con.query(sql, user, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(`User ${(user.fullname, user.email)} created successfully`);
      });
    } catch (error) {
      console.log(error);
    }
  });
  
  // Login
  // The Route where Decryption happens
    router.post("/login", (req, res) => {
        try {
          let sql = "SELECT * FROM users WHERE ?";
          let user = {
            email: req.body.email,
          };
          con.query(sql, user, async (err, result) => {
            if (err) throw err;
            if (result.length === 0) {
              res.send("Email not found please register");
            } else {
              const isMatch = await bcrypt.compare(
                req.body.password,
                result[0].password
              );
              if (!isMatch) {
                res.send("Password incorrect");
              } else {
                // The information the should be stored inside token
                const payload = {
                  user: {
                    id: result[0].id,
                    fullname: result[0].fullname,
                    email: result[0].email,
                    userRole: result[0].userRole,
                    phone: result[0].phone,
                    created: result[0].created,
                    cart: result[0].cart,
                  },
                };
                // Creating a token and setting expiry date
                jwt.sign(
                  payload,
                  process.env.jwtSecret,
                  {
                    expiresIn: "365d",
                  },
                  (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                    console.log(req.body);
                  }
                );
              }
            }
          });
        } catch (error) {
          console.log(error);
        }
      });


      // Verify
router.get("/users/verify", (req, res) => {
    const token = req.header("x-auth-token");
    jwt.verify(token, process.env.jwtSecret, (error, decodedToken) => {
      if (error) {
        res.status(401).json({
          msg: "Unauthorized Access!",
        });
      } else {
        res.status(200);
        res.send(decodedToken);
      }
    });
  });


  router.get("/", middleware, (req, res) => {
    try {
      let sql = "SELECT * FROM users";
      con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
      });
    } catch (error) {
      console.log(error);
    }
  });


module.exports = router;