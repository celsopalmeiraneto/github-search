const axios = require('axios');
/**
  Class GitHub is a Remote Facade (https://martinfowler.com/eaaCatalog/remoteFacade.html)
  which knows how to consume the GitHub API and translate the requests to
  the needs of this project.
*/
class GitHub {
  /**
  */
  constructor() {
    this.axiosGH = axios.create({
      baseURL: 'https://api.github.com/',
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (process.env.GH_CLIENT_ID && process.env.GH_CLIENT_SECRET) {
      if (!this.axiosGH.defaults.hasOwnProperty('params')) {
        this.axiosGH.defaults.params = {};
      }
      this.axiosGH.defaults.params['client_id'] = process.env.GH_CLIENT_ID;
      this.axiosGH.defaults.params['client_secret'] =
        process.env.GH_CLIENT_SECRET;
    }
  }

  /**
  @private
  @param {string} headerLink - Header "Link", sent from GH API.
  @return {object} - Object with the parsed Link.
  */
  _parseHeaderLink(headerLink) {
    const arrLink = headerLink.split(',');

    return arrLink.reduce((acc, v) => {
      v = v.split(';')
          .map((v) =>
            v.trim()
                .replace(/(<)|(>)+/g, ''));
      v[1] = v[1].replace('rel=', '').replace(/(")+/g, '');
      acc[v[1]] = v[0];
      return acc;
    }, {});
  }


  /**
  @private
  @param {string} users - Users found on the GH API.
  @return {array} - Array of users containing only the info we want.
  */
  _parseUsersFromSearch(users) {
    if (!Array.isArray(users)) {
      throw new Error('Users must be an array.');
    }
    return users.map((user) => {
      return user.login;
    });
  }

  /**
  @param {string} username
  @return {array} - Array of repos names.
  */
  async getReposOfUser(username) {
    let link = {
      next: `/users/${username}/repos`,
    };
    let repos = [];
    while (typeof link === 'object' && link !== null
      && link.hasOwnProperty('next')) {
      const response = await this.axiosGH.get(link.next);

      if (response.headers.hasOwnProperty('link')) {
        link = this._parseHeaderLink(response.headers.link);
      } else {
        link = null;
      }

      if (!Array.isArray(response.data)) continue;

      const newRepos = response.data.map((repo) => repo.name);
      repos = [...repos, ...newRepos];
    }
    return repos;
  }

  /**
  @param {string} username
  @return {object} - User containing only the info we want.
  */
  async getUserByUsername(username) {
    const response = await this.axiosGH.get(`/users/${username}`);
    if (response.status === 404) return null;

    return {
      avatarURL: response.data.avatar_url,
      followers: response.data.followers,
      name: response.data.name,
      username: response.data.login,
    };
  }

  /**
  @param {string} username - The username to search for.
  @return {array} - The list of users found using a usetname like the one given.
  */
  async searchUsersByUsername(username) {
    if (typeof username !== 'string') {
      throw new Error('Username must be an string');
    }
    if (username.length === 0) {
      throw new Error('Username cannot be an empty string');
    }

    let userList = [];

    let response = await this.axiosGH.get('/search/users', {
      params: {
        per_page: 100,
        q: `${username} in:login`,
      },
    });

    if (response.data.total_count === 0) {
      return [];
    }

    userList = [...userList, ...this._parseUsersFromSearch(
        response.data.items)];

    while (response.headers.link && typeof response.headers.link === 'string') {
      const link = this._parseHeaderLink(response.headers.link);
      if (link.next) {
        response = await this.axiosGH.get(link.next);
        userList = [...userList, ...this._parseUsersFromSearch(
            response.data.items
        )];
      }
    }

    return userList;
  }

  /**
  @param {string} username - The username to be searched for.
  @param {array} languages - The list of languages to search in each user found.
  @return {array} - The list of users with some info about the user as well as some info
  regarding the languages searched.
  */
  async searchUsersByUsernameAndLanguages(username, languages) {
    const userList = await this.searchUsers(username);
  }
}
module.exports = GitHub;