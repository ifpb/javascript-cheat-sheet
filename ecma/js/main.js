Array.prototype.uniq = function (a) {
  return function () {
    return this.filter(a)
  }
}(function (a, b, c) {
  return c.indexOf(a, b + 1) < 0
})

const docs = {
  'Array': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
  'Boolean': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
  'Date': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date',
  'Function': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
  'Intl': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl',
  'JSON': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON',
  'Map': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map',
  'Math': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math',
  'Number': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number',
  'Object': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
  'RegExp': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp',
  'Set': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set',
  'String': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
  'Symbol': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol',
  'Statements': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference#Statements',
  'Expressions_and_operators': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference#Expressions_and_operators',
  'Function_properties': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects#Function_properties',
  'Value_properties': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects#Value_properties'
}

async function loadData() {

  const docsData = await getDocsData(Object.keys(docs))

  for (const [name, doc] of Object.entries(docsData)) {
    createElement(name, doc, docs)
  }
}

async function getDocsData(docs) {
  const docsData = {}

  await Promise.all(
    docs.map(async (doc) => {
      const response = await fetch(`json/${doc.toLowerCase()}.json`)
      const json = await response.json()
      docsData[doc] = json
    })
  )

  return docsData
}

function createElement(id, doc, mdn) {
  const element = document.querySelector(`#${id}`)
  const lines = doc.map(item => {
    const line = {
      value: `<div class="command"><a href="${item.url}" target="_blank">${item.syntax || item.name}</a></div>`
    }
    if (item.group)
      line.group = `<h4 class="title">${item.group}</h4>`
    if (item.type)
      line.type = `<h5 class="title">${item.type}</h5> <!-- ${item.group} -->`
    if (item.category)
      line.category = `<h6 class="title">${item.category}</h6>`
    if (item.note)
      line.note = item.note
    return line
  })

  let groups = lines.map(line => line.group).uniq()
  let types = lines.map(line => line.type).uniq()
  let categories = lines.map(line => line.category).uniq()

  const newLines = [
    `<h3 class="title">
      <a href="${mdn[id]}" target="_blank">
        ${id.replace(/_/g, ' ')}
      </a>
    </h3>`
  ]

  let groupOpen = false
  let groupsLength = groups.length
  lines.forEach((line, index) => {
    if (!line.note) {
      if (groups.includes(line.group)) {
        if (groups.length == groupsLength) {
          newLines.push('<div class="group">')
          groupOpen = true
        } else {
          newLines.push('</div><div class="group">')
        }
        groups = groups.filter(group => group != line.group)
        newLines.push(line.group)
      }

      if (types.includes(line.type)) {
        types = types.filter(type => type != line.type)
        newLines.push(line.type)
      }

      if (categories.includes(line.category)) {
        categories = categories.filter(category => category != line.category)
        newLines.push(line.category)
      }

      newLines.push(line.value)

      if(groupOpen && index == lines.length) {
        newLines.push('</div>')
      }
    }
  })

  element.innerHTML = newLines.join('')
}

loadData()