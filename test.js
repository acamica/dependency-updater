const YAML = require('yaml');
const fs   = require('fs');

const map_servicesImage = doc => doc
  .contents.items.filter(e => e.key.value === 'services')[0]
  .value.items.map(e => ({
      [e.key.value]: getImageNodeInsideService(e).value
  }))
  .reduce((p,c) => ({...p,...c}), {})

const getImageNodeInsideService = node => node.value.items.filter(e => e.key.value === 'image')[0].value

const findNode_servicesImage = (doc,image) => doc
  .contents.items.filter(e => e.key.value === 'services')[0]
  .value.items.filter(e => getImageNodeInsideService(e).value.includes(image))

const repo = 'acamica/app'
const newVersion = '1234567'

try {
  const doc = YAML.parseDocument(fs.readFileSync('pepe2.yml', 'utf8'));

  const serviceNode = findNode_servicesImage(doc,`registry.acamica.com/${repo}`)
  const imageNode = getImageNodeInsideService(serviceNode[0])

  const [name, version] = imageNode.value.split(':')
  imageNode.value = [name, newVersion].join(':')
  imageNode.comment = `https://github.com/${repo}/compare/${version}...${newVersion}`

  console.log(String(doc));
} catch (e) {
  console.log(e);
}

