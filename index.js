import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

const searcher = async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    // args: ['--window-size=1280,720'],
  })

  const context = await browser.createIncognitoBrowserContext()
  const page = await context.newPage()
  await page.setViewport({ width: 2000, height: 200000 })
  await page.goto(
    `https://www.lenskart.com/eyeglasses/marketing/vc-air-bestseller-eyeglasses.html#lenskart_price=2&prescription_type_id=10620&frame_weight_group_id=14109&gender_id=10529&frame_size_id=24069&dir=desc&sort=created&gan_data=true`
  )

  await autoScroll(page)

  try {
    const data = await page.$$eval('.img-responsive', (results) =>
      results.map((result) => {
        return { link: result.src }
      })
    )

    const folder = Date.now()

    fs.mkdir(process.cwd() + '/downloads/' + folder, { recursive: true }, (err) => {
      if (err) throw err

      console.log(`Directory ${folder} successfully created! Downloading ${data.length} images!`)

      data.forEach(async (element) => {
        const title = element.link.split('/')

        await axios
          .get(element.link, {
            responseType: 'arraybuffer',
          })
          .then((response) => {
            fs.writeFileSync(`downloads/${folder}/${title[title.length - 1]}`, response.data, 'base64')
          })
      })
    })
  } catch {
    console.log('Something Went Wrong!')
  }

  await browser.close()
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0
      var distance = 100
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
}

searcher()
