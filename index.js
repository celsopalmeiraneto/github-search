require('./config.js');
const express = require('express');
const GitHub = require('./remoteFacades/GitHub.js');
const log4js = require('log4js');

const app = express();
const logger = log4js.getLogger('entry point');

app.get('/', (req, res) => {
  return res.send('Hello World!');
});

app.get('/search/users/:username/languages/:languages', async (req, res) => {
  logger.trace('request from ', req.ip, 'params: ', req.params);
  try {
    const languages = req.params.languages
        .split(',')
        .map((language) => language.trim());
    logger.trace('languages: ', languages);

    const ghFacade = new GitHub();

    const users = await ghFacade.searchUsersByUsernameAndLanguages(
        req.params.username, languages
    );

    if (!Array.isArray(users)) {
      throw new Error('Unexpected results from call');
    }

    if (users.length === 0) {
      res.status(404);
      res.send();
    }

    res.json(users);
  } catch (e) {
    if (e.code === GitHub.ERR_TIMEOUT) {
      res.status(408);
      res.send(e.message);
    } else {
      return returnError(e, res);
    }
  }
});

/**
  @param {object} e -  Error to be printed.
  @param {object} res - Express Response object.
*/
function returnError(e, res) {
  logger.error(e);
  res.status(500).send({
    message: e.toString(),
    stack: e.stack,
  });
}

app.listen(3000);
