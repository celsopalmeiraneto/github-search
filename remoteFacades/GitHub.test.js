const GitHub = require('./GitHub.js');

test('parse user from github search', () => {
  const gh = new GitHub();
  expect(gh._parseUsersFromSearch([{
    'login': 'celsopalmeiraneto',
    'id': 1665576,
  }])).toEqual(['celsopalmeiraneto']);
});

test('search users by a username', async () => {
  const resp = ['celsopalmeiraneto'];

  const gh = new GitHub();
  gh.axiosGH.get = jest.fn(() => {
    return Promise.resolve(
        {
          'data': {
            'total_count': 1,
            'incomplete_results': false,
            'items': [
              {
                'login': 'celsopalmeiraneto',
                'id': 1665576,
                'node_id': 'MDQ6VXNlcjE2NjU1NzY=',
                'type': 'User',
                'site_admin': false,
                'score': 91.60553,
              },
            ],
          },
          'headers': {
          },
        }
    );
  });

  return gh.searchUsersByUsername('celsopalmeiraneto')
      .then((user) => expect(user).toEqual(resp));
});

test('get user by username', () => {
  const gh = new GitHub();
  gh.axiosGH.get = jest.fn(() => {
    return Promise.resolve(
        {
          data: {
            login: 'celsopalmeiraneto',
            id: 1665576,
            node_id: 'MDQ6VXNlcjE2NjU1NzY=',
            avatar_url: 'https://avatars1.githubusercontent.com/u/1665576?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/celsopalmeiraneto',
            html_url: 'https://github.com/celsopalmeiraneto',
            type: 'User',
            site_admin: false,
            name: 'Celso Palmeira Neto',
            company: null,
            blog: 'https://www.celsoneto.com.br',
            location: 'Vila Velha, Espirito Santo, Brazil',
            email: null,
            hireable: true,
            bio: null,
            public_repos: 22,
            public_gists: 1,
            followers: 14,
            following: 13,
            created_at: '2012-04-21T12:51:05Z',
            updated_at: '2018-11-08T17:35:05Z',
          },
        }
    );
  });
  return gh.getUserByUsername('celsopalmeiraneto')
      .then((user) => expect(user).toEqual({
        avatarURL: 'https://avatars1.githubusercontent.com/u/1665576?v=4',
        followers: 14,
        name: 'Celso Palmeira Neto',
        username: 'celsopalmeiraneto',
      }));
});

test('get repos of a user', () => {
  const gh = new GitHub();
  gh.axiosGH.get = jest.fn()
      .mockImplementationOnce(() => {
        return Promise.resolve(
            {
              data: [
                {
                  name: 'a',
                },
                {
                  name: 'b',
                },
              ],
              headers: {
                /* eslint-disable */
                link: '<https://api.github.com/user/1342004/repos?page=44>; rel="prev", <https://api.github.com/user/1342004/repos?page=46>; rel="next", <https://api.github.com/user/1342004/repos?page=46>; rel="last", <https://api.github.com/user/1342004/repos?page=1>; rel="first"'
                /* eslint-enable */
              },
            }
        );
      })
      .mockImplementationOnce(() => {
        return Promise.resolve(
            {
              data: [
                {
                  name: 'c',
                },
                {
                  name: 'd',
                },
              ],
              headers: {
                /* eslint-disable */
                link: '<https://api.github.com/user/1342004/repos?page=46>; rel="prev", <https://api.github.com/user/1342004/repos?page=46>; rel="last", <https://api.github.com/user/1342004/repos?page=1>; rel="first"'
                /* eslint-enable */
              },
            }
        );
      });
  return gh.getReposOfUser('celsopalmeiraneto')
      .then((repos) => expect(repos).toEqual(['a', 'b', 'c', 'd']));
});

test('get languages of a repo', () => {
  const gh = new GitHub();
  gh.axiosGH.get = jest.fn().mockImplementation(() => {
    return Promise.resolve(
        {
          'PHP': 54528,
          'HTML': 668,
          'JavaScript': 643,
        }
    );
  });
  return gh.getReposOfUser('biKamar')
      .then((user) => expect(user).toEqual({
        'PHP': 54528,
        'HTML': 668,
        'JavaScript': 643,
      }));
});
