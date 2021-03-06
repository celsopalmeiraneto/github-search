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
  const timeout = process.env.hasOwnProperty('REQUEST_TIMEOUT')
    ? Number.parseInt(process.env.REQUEST_TIMEOUT) : 120000;

  let aborted = false;
  const ghFacade = new GitHub();

  res.setTimeout(timeout, () => {
    aborted = true;
    ghFacade.abort();
    return res.status(408).send('Operation has timed out.');
  });

  try {
    const languages = req.params.languages
        .split(',')
        .map((language) => language.trim());
    logger.trace('languages: ', languages);

    const users = await ghFacade.searchUsersByUsernameAndLanguages(
        req.params.username, languages
    );

    if (!Array.isArray(users)) {
      throw new Error('Unexpected results from call');
    }

    if (users.length === 0) {
      res.status(404);
      return res.send();
    }

    res.json(users);
  } catch (e) {
    if (aborted) {
      logger.warn('The request has been aborted.');
      return;
    }
    if (e.code === GitHub.ERR_TIMEOUT) {
      return res.status(408).send(e.message);
    } else {
      return returnError(e, res);
    }
  }
});

/**
  @param {object} e -  Error to be printed.
  @param {object} res - Express Response object.
  @return {object} - http response.
*/
function returnError(e, res) {
  logger.error(e);
  return res.status(500).send({
    message: e.toString(),
    stack: e.stack,
  });
}

app.listen(3000);
