const fs = require("fs");
const puppeteer = require("puppeteer");
const url = require("url");

let contents;
let urlPath;
let fileName;

(async function startCrawling() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1920,1080"],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  const folderNameFcn = () => prompt("폴더명을 입력해주세요", "");

  const folderName = await page.evaluate(folderNameFcn);
  if (folderName === "") {
    await browser.close();
    return false;
  }
  await page.goto(`https://www.ok.ac.kr/${folderName}/index.do`);

  await createFolder(folderName);

  const $selector1ndMenuLength = await page.$$eval(
    "#header > div > div.lnb > nav > div > ul > li",
    (data) => data.length
  );
  await page.waitForTimeout(1000);

  for (let index = 1; index <= $selector1ndMenuLength; index++) {
    await select1stMenu(page, index, folderName);
  }

  startCrawling();
})();

async function select1stMenu(page, index, folderName) {
  await page.waitForTimeout(1000);
  await page.click(`#header > div > div.lnb > nav > div > ul > li:nth-child(${index}) > a`);
  await page.waitForTimeout(1000);
  const $selector2ndMenuLength = await page.$$eval(
    "#container > div > div.side > nav > div > ul > li",
    (data) => data.length
  );
  await page.waitForTimeout(1000);
  // console.log($selector2ndMenuLength);
  await page.waitForTimeout(1000);

  // #container > div > div.side > nav > div > ul > li.depth1_item.active // 처음 2차메뉴 들어갔을때 클래스명 변경으로 인해 추가
  // console.log(contents);
  await page.waitForTimeout(1000);
  for (let index2 = 1; index2 <= $selector2ndMenuLength; index2++) {
    console.log($selector2ndMenuLength, "selector2ndMenuLength");
    // 1차 메뉴 진입시 1번째 인덱스 클래스명이 달라서 2번부터 시작
    await select2stMenu(page, index2, folderName);
  }
}

async function select2stMenu(page, index2, folderName) {
  if (index2 !== 1) {
    await page.click(`#container > div > div.side > nav > div > ul > li:nth-child(${index2}) > a`);
  }
  console.log(index2, "index2");
  await page.waitForTimeout(3000);
  contents = await page.$eval("#contents", (el) => el.outerHTML);
  const currentUrl = () => {
    return window.location.pathname;
  };
  const currentUrlParams = () => {
    return window.location.href;
  };
  await page.waitForTimeout(1000);
  urlPath = await page.evaluate(currentUrl); // puppeteer에서 javascript 사용하려면 함수 만들어서 리턴하고 page.evaluate() 안에 넣어줘야함
  fileName = await page.evaluate(currentUrlParams);
  await page.waitForTimeout(1000);
  fileName = url.parse(fileName, true).query.key; // key값 추출
  await page.waitForTimeout(2000);
  console.log(urlPath, fileName);
  if (urlPath !== `/${folderName}/selectBbsNttList.do`) {
    await createFile(folderName, fileName, contents);
    await page.waitForTimeout(1000);
  }
}

async function createFolder(folderName) {
  fs.readdir(`${folderName}/contents`, (error) => {
    // uploads 폴더 없으면 생성
    if (error) {
      fs.mkdirSync(`${folderName}/contents`, { recursive: true });
    }
  });
}

async function createFile(folderName, fileName, contents) {
  fs.writeFile(`${folderName}/contents/${fileName}.html`, contents, function (err) {
    if (err === null) {
      console.log("success");
    } else {
      console.log("fail");
    }
  });
}
