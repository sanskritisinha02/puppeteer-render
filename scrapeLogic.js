const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
const browser = await puppeteer.launch({
args: [
"--disable-setuid-sandbox",
"--no-sandbox",
"--single-process",
"--no-zygote",
],
executablePath:
process.env.NODE_ENV === "production"
? process.env.PUPPETEER_EXECUTABLE_PATH
: puppeteer.executablePath(),
});
try {
var sendingObject = [];
const page = await browser.newPage()

await page.goto('https://www.goal.com/en-in')
await page.evaluate(() => {
const unwantedSection = document.querySelector('[card-group-type="TOP_VIDEOS"]');
if (unwantedSection) {
unwantedSection.remove();
}
});

// for titles
var linkTexts = await page.$$eval("h3.title.h5 > span",
elements=> elements.map(item=>item.textContent))
console.log(linkTexts.length)

// for images
const imgs = await page.$$eval('img.component-image', imgs => imgs.map(img => img.getAttribute('srcset')));

console.log(imgs.length)
var urlToArticles = await page.$$eval('[data-testid="card-title-url"]',
elements => elements.map(element => element.getAttribute('href')))


for(let i = 0; i<3;i++){
if(linkTexts[i] != undefined){
const regex = /https:\/\/(?!.*https:\/\/).*?3840w/g;
const match = imgs[i].match(regex);
let url = ""
if (match && match.length > 0) {
url = match[0];
} else {
url = ""
}
var temp = {"title":linkTexts[i],
"img": url.slice(0, -6),
"url": 'https://www.goal.com'+urlToArticles[i]
}
sendingObject.push(temp);
}
}
console.log(sendingObject)
res.send(sendingObject)
// await Promise.all([
// page.waitForNavigation(),
// page.click('p.NewsTeaserV2_teaser__title__41fg5')
// ]);


// const paragraphs = await page.$$eval('.ArticleParagraph_articleParagraph__hR05e p', (elements) => {
// return elements.map((element) => element.textContent || '');
// });
// console.log(paragraphs);
// const article = paragraphs.join(" ")
// console.log(article)






await browser.close();
} catch (e) {
console.error(e);
res.send(`Something went wrong while running Puppeteer: ${e}`);
} finally {
await browser.close();
}
};

module.exports = { scrapeLogic };