require('dotenv').config();

const express = require('express');
const app = express();

const GitHub = require('./remoteFacades/GitHub.js');

app.get('/', (req, res) => {
  try {
    const teste = new GitHub();
    teste.getReposOfUser('google')
        .then((data) => {
          return res.json(data);
        })
        .catch((err) => {
          return returnError(err, res);
        });
  } catch (e) {
    return returnError(e, res);
  }
});

/**
  @param {object} e -  Error to be printed.
  @param {object} res - Express Response object.
*/
function returnError(e, res) {
  res.status(500).send({
    message: e.toString(),
    stack: e.stack,
  });
}

app.listen(3000);
