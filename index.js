const fs = require("fs");
const puppeteer = require("puppeteer");
const url = require("url");

(async function createFolder() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--window-size=1920,1080"],
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
    });
    const folderNameFcn = () => prompt("폴더명을 입력해주세요", "nurse");
    const folderName = await page.evaluate(folderNameFcn);
    await page.goto(`https://www.ok.ac.kr/nurse/index.do`);
    const $selector1ndMenuLength = await page.$$eval(
        "#header > div > div.lnb > nav > div > ul > li",
        (data) => data.length
    );
    await page.waitForTimeout(1000);
    for (let index = 1; index <= $selector1ndMenuLength; index++) {
        await page.click(
            `#header > div > div.lnb > nav > div > ul > li:nth-child(${index}) > a`
        );
        await page.waitForTimeout(1000);
        const $selector2ndMenuLength = await page.$$eval(
            "#container > div > div.side > nav > div > ul > li",
            (data) => data.length
        );
        await page.waitForTimeout(1000);
        // console.log($selector2ndMenuLength);
        await page.waitForTimeout(1000);
        let contents = await page.$eval("#contents", (el) => el.outerHTML);
        // #container > div > div.side > nav > div > ul > li.depth1_item.active // 처음 2차메뉴 들어갔을때 클래스명 변경으로 인해 추가
        // console.log(contents);
        await page.waitForTimeout(1000);
        for (let index2 = 2; index2 <= $selector2ndMenuLength; index2++) {
            // if (await page.$$eval("#container > div > div.side > nav > div > ul > li.depth1_item.active > div")) { // 나중에 3차 li여부 체크
                
            // }
            const currentUrl = () => {
                return window.location.pathname;
            };
            const currentUrlParams = () => {
                return window.location.href;
            };
            await page.waitForTimeout(1000);
            let urlPath = await page.evaluate(currentUrl); // puppeteer에서 javascript 사용하려면 함수 만들어서 리턴하고 page.evaluate() 안에 넣어줘야함
            let fileName = await page.evaluate(currentUrlParams);
            await page.waitForTimeout(1000);
            fileName = url.parse(fileName, true).query.key;
            await page.waitForTimeout(1000);
            // console.log(fileName);
            await page.waitForTimeout(1000);
            if (urlPath !== `/${folderName}/selectBbsNttList.do`) {
                folderCreate(folderName, fileName, contents);
            }
            await page.click(
                `#container > div > div.side > nav > div > ul > li:nth-child(${index2}) > a`
            );
            await page.waitForTimeout(1000);
            contents = await page.$eval("#contents", (el) => el.outerHTML);
        }
    }
    createFolder();
})();

function folderCreate(folderName, fileName, contents) {
    fs.readdir(`${folderName}/contents`, (error) => {
        // uploads 폴더 없으면 생성
        if (error) {
            fs.mkdirSync(`${folderName}/contents`, { recursive: true });
        }
        fs.writeFile(
            `${folderName}/contents/${fileName}.html`,
            contents,
            function (err) {
                if (err === null) {
                    console.log("success");
                } else {
                    console.log("fail");
                }
            }
        );
    });
}
