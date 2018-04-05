const puppeteer = require('puppeteer');
const fs = require('fs');
const doc = 'Symbol'

async function crawler() {
  const url = `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/${doc}`
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)
  
  let elements = await page.evaluate(() => {
    const selected = Array.from(document.querySelectorAll('dt a'))
    return selected.map(element => {
      const name = element.innerHTML
      const url = element.href
      return { name, url }
    })
  })

  elements = await Promise.all(
    elements.map(async (element, index) => {
      const syntaxPage = await browser.newPage()
      await syntaxPage.goto(element.url, {
        timeout: 3000000
      })
      element.syntax = await syntaxPage.evaluate(() => {
        const syntax = document.querySelector('#Syntax + .syntaxbox')
        return syntax ? syntax.innerHTML : ''
      })
      await syntaxPage.close()
      return element
    })
  )
  
  await page.close()
  await browser.close()

  return elements
}

crawler()
  .then(elements => {
    fs.writeFile(`../json/${doc.toLowerCase()}.json`, JSON.stringify(elements))
  })