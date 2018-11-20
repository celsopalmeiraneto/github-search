const GitHub = require('./GitHub.js');

test('parse user from github search', () => {
  const gh = new GitHub();
  expect(gh._parseUsersFromSearch([{
    'login': 'celsopalmeiraneto',
    'id': 1665576,
  }])).toEqual(['celsopalmeiraneto']);
});

test('fails when given an wrong search input', () => {
  const gh = new GitHub();
  expect(() => {
    gh._parseUsersFromSearch({
      'login': 'celsopalmeiraneto',
      'id': 1665576,
    });
  }).toThrow();
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
  expect.assertions(1);
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
  expect.assertions(1);
  return gh.getReposOfUser('celsopalmeiraneto')
      .then((repos) => expect(repos).toEqual(['a', 'b', 'c', 'd']));
});

test('get languages of a repo', () => {
  const gh = new GitHub();
  gh.axiosGH.get = jest.fn().mockImplementationOnce(() => {
    return Promise.resolve({
      data: {'PHP': 54528, 'HTML': 668, 'JavaScript': 643},
    });
  });
  expect.assertions(1);
  return expect(gh.getLanguagesOfRepo('celsopalmeiraneto', 'biKamar'))
      .resolves.toEqual({'PHP': 54528, 'HTML': 668, 'JavaScript': 643});
});

test('parse header link', () => {
  const gh = new GitHub();
  /* eslint-disable max-len*/
  const parsed1 = gh._parseHeaderLink(
      '<https://api.github.com/user/1342004/repos?page=2>; rel="next", <https://api.github.com/user/1342004/repos?page=46>; rel="last"'
  );
  expect(parsed1.next).toEqual('https://api.github.com/user/1342004/repos?page=2');
  expect(parsed1.last).toEqual('https://api.github.com/user/1342004/repos?page=46');

  const parsed2 = gh._parseHeaderLink(
      '<https://api.github.com/user/1342004/repos?page=45>; rel="prev", <https://api.github.com/user/1342004/repos?page=1>; rel="first"'
  );
  expect(parsed2.prev).toEqual('https://api.github.com/user/1342004/repos?page=45');
  expect(parsed2.first).toEqual('https://api.github.com/user/1342004/repos?page=1');
  expect(parsed2).not.toHaveProperty('next');
  /* eslint-enable max-len*/
});
