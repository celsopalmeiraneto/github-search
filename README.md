# github-search

## What is that?
Hello! This is an API that helps you to find out if a GitHub user has one or more languages in one of its repos.

## How it works?
After giving to the endpoint a username and one or more languages to search for, this service will search for users by the given username, then, it will check the languages of all repos these users have and return some info about the user along with the languages you first mentioned.

Example... If you search for the user 'celsopalmeiraneto' and languages 'javascript and erlang', as of Nov 22nd 2018, you will have the info about Celso and will notice that he has JavaScript on his repos, but not erlang.

### Caveats - You SHOULD read it.
As this service does scan all repos, for all users found, it will probably run over the GitHub's API quota very fast!!! If you search, for example, for the user 'google', it will consume all hourly limit on the blink of an eye, as it will search for all users with 'google' in the name.

## How to use it?

1. Clone this repo in your local machine.
2. Download, install and run [Docker](https://www.docker.com/products/docker-desktop).
3. Open your terminal and navigate to the directory where you downloaded this repo.
4. If you have a CLIENT_ID and CLIENT_SECRET of a GitHub app or want to set a custom timeout, create a copy of the file ` .env.example ` as ` .env ` and fill the environment variables.

  On Windows, run: `copy .env.example .env`;
  On MacOS or Linux, run: `cp .env.example .env`

5. Run the following command: ` docker build -t gh-search . ` **Don't forget to copy the "." at the end.**
6. Run the command ` docker run -p <port>:3000 -d gh-search `, replace ` <port> ` with an available port in your computer.
7. Now you can consume the API using the port you defined. Check the API for more info.


## API

#### GET '/'
Here you will find a simple Hello World message!

#### GET '/search/users/:username/languages/:languages'
` :username ` - The username to search for.

` :languages ` - A comma separated list of languages.
##### Example:
In my computer, I used the port "3001", to test I would use:
`http://127.0.0.1:3001/search/users/celsopalmeiraneto/languages/javascript, erlang `

Where `http://127.0.0.1:3001` is the host and port, and `/search/users/celsopalmeiraneto/languages/javascript, erlang ` is the method I am calling.

## TO-DO
- [ ] Implement integration tests.
- [x] Replace the Promise.All with serial operations. GitHub [does not recommend](https://developer.github.com/v3/guides/best-practices-for-integrators/#dealing-with-abuse-rate-limits) parallel calls to its API.
- [ ] Implement caching of the requests.
