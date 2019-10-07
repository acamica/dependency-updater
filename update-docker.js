const YAML = require('yaml');
const Octokit = require("@octokit/rest");
const octokit = new Octokit({
  auth: "6db3292ebcbcbf4fb994ad760735b61132dcdcb1"
});

const owner = 'acamica'
const repo = 'acamica-stack'
const path = 'docker-compose.yml'
const branch = 'acamibot-update'

const dependency = {
  name: 'acamica/acamica-login-service',
  version: '52ac1bc',
}

const getImageNodeInsideService = node => node.value.items.filter(e => e.key.value === 'image')[0].value

const findNode_servicesImage = (doc,image) => doc
  .contents.items.filter(e => e.key.value === 'services')[0]
  .value.items.filter(e => getImageNodeInsideService(e).value.includes(image))

const run = async () => {

  const git_branch = (await octokit.repos.getBranch({ owner, repo, branch })).data

  const git_content = (await octokit.repos.getContents({
    owner, repo, path,
    ref: git_branch.commit.sha
  })).data

  const file = Buffer.from(git_content.content, 'base64').toString('ascii')
  ////////////////////////////////////////

  const doc = YAML.parseDocument(file);

  const serviceNode = findNode_servicesImage(doc,`registry.acamica.com/${dependency.name}`)
  const imageNode = getImageNodeInsideService(serviceNode[0])

  const [name, version] = imageNode.value.split(':')
  imageNode.value = [name, dependency.version].join(':')
  imageNode.comment = `https://github.com/${dependency.name}/compare/${version}...${dependency.version}`

  const result = String(doc)
  
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