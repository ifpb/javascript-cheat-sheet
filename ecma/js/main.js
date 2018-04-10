Array.prototype.uniq = function (a) {
  return function () {
    return this.filter(a)
  }
}(function (a, b, c) {
  return c.indexOf(a, b + 1) < 0
})

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

function createElement(id, docsData) {
  const element = document.querySelector(`#${id}`)
  const lines = docsData[`${id}`].map(item => {
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
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${id}" id="${id}" target="_blank">${id.replace(/-/g, ' ')}</a>
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

(async () => {
  const docs = [
    'Array',
    'Boolean',
    'Date',
    'Function',
    'Intl',
    'JSON',
    'Map',
    'Math',
    'Number',
    'Object',
    'RegExp',
    'Set',
    'String',
    'Symbol',
    'Statements',
    'Expressions-and-operators',
    'Function-properties',
    'Value-properties'
  ]

  const docsData = await getDocsData(docs)
  for (const [name, doc] of Object.entries(docsData)) {
    createElement(name, docsData)
  }
})()