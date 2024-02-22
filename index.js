import puppeteer from "puppeteer";
import fs from "fs/promises"

const getTitles = async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  await page.goto('https://sea.mashable.com/tech/');
  await page.waitForSelector('.blogroll');

  const postsItems = await page.evaluate(() => {
    const posts = document.body.querySelectorAll('.blogroll');
    const postsItems = [];

    posts.forEach((item) => {
      let title = ''
      let summary = ''
      let link = ''
      let date = ''
      try{
        title= item.querySelector('.caption').innerText;
        if (title != '') {
          summary = item.querySelector('.deck').innerText
          link = item.querySelector('a').href;
          date = item.querySelector('.datepublished').innerText
          postsItems.push({ title, summary, link, date })
        }
      }catch(e) {}
    });

    return postsItems;
  });

  // await browser.close();

  // Writes the titles to an HTML file
  await writeTitlesToHTML(postsItems);
};

const writeTitlesToHTML = async (postsItems) => {
  let htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Title Aggregation</title>
      <style>
        .title {
          margin-bottom: 20px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        h2 {
          margin-top: 0;
        }
      </style>
    </head>
    <body>
      <div id="titles-container">
  `;

  postsItems.forEach(postItem => {
    htmlContent += `
    <div class="title">
      <h2><a href=${postItem.link} target="_blank">${postItem.title}</a></h2>
      <p>${postItem.summary}</p>
      <p>Date: ${postItem.date}</p>
    </div>
    `;
  });

  htmlContent += `
      </div>
    </body>
  </html>
  `;

  
  // Create html file to display news titles
  await fs.writeFile('titles.html', htmlContent); 
};

getTitles();
