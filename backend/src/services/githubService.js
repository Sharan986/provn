const axios = require('axios');
const { Octokit } = require('@octokit/rest');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
// The callback URL should match the one configured in the GitHub OAuth App
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/github/callback';

function getGithubAuthUrl(state) {
  const scope = 'repo user'; // 'repo' is needed to create repositories
  return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&state=${state}`;
}

async function getGithubAccessToken(code) {
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub access token:', error.response?.data || error.message);
    throw new Error('Failed to fetch GitHub access token');
  }
}

async function getGithubUserProfile(accessToken) {
  const octokit = new Octokit({ auth: accessToken });
  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    return data;
  } catch (error) {
    console.error('Error fetching GitHub user profile:', error);
    throw new Error('Failed to fetch GitHub user profile');
  }
}

async function provisionTemplateRepo(accessToken, templateOwner, templateRepo, newRepoName) {
  const octokit = new Octokit({ auth: accessToken });
  try {
    // We create the repository from the template
    const response = await octokit.rest.repos.createUsingTemplate({
      template_owner: templateOwner,
      template_repo: templateRepo,
      name: newRepoName,
      private: false, // The user requested public for now
      include_all_branches: false,
    });
    return response.data;
  } catch (error) {
    console.error('Error provisioning template repo:', error);
    throw new Error(error.response?.data?.message || 'Failed to provision template repository');
  }
}

module.exports = {
  getGithubAuthUrl,
  getGithubAccessToken,
  getGithubUserProfile,
  provisionTemplateRepo,
};
