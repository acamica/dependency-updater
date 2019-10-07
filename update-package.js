const Octokit = require("@octokit/rest");
const octokit = new Octokit({
  auth: "6db3292ebcbcbf4fb994ad760735b61132dcdcb1"
});

const owner = 'acamica'
const repo = 'backoffice-frontend'
const path = 'package.json'
const branch = 'master'

const dependency = {
  name: '@acamica/acamica-views',
  version: '1.0.1-478b8ca1.0',
}


const run = async () => {

  const git_branch = (await octokit.repos.getBranch({ owner, repo, branch })).data

  const git_content = (await octokit.repos.getContents({
    owner, repo, path,
    ref: git_branch.commit.sha
  })).data

  const file = Buffer.from(git_content.content, 'base64').toString('ascii')
  ////////////////////////////////////////

  const package = JSON.parse(file)

  const version = package.dependencies[dependency.name]
  if (!package.dependencies[dependency.name]) {
    return Promise.reject(`${owner}/${repo}:${branch} does not contains dependency ${dependency.name} in ${path}`)
  }

  const result = JSON.stringify({
    ...package,
    dependencies: {
      ...package.dependencies,
      [dependency.name]: dependency.version
    }
  },null, 4)

  //////////////////////////////
  const content = Buffer.from(result).toString('base64')

  const response = (await octokit.repos.createOrUpdateFile({
    owner, repo, path, content, branch,
    sha: git_content.sha,
    message: `updated from ${version} to ${dependency.version}`
  })).data

  console.log(response)
}

run().catch(error => {
  console.error(error)
})