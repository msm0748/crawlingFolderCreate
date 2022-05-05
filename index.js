const fs = require("fs");

const folderName = prompt("폴더명을 입력해주세요", "ex)nurse");

const url = `https://www.ok.ac.kr/${folderName}/index.do`;
const $selector1ndMenu = "#header > div > div.lnb > nav > div > ul";
const $selector2ndMenu = "#container > div > div.side > nav > div > ul";

const pathName = window.location.pathname;

let contents = "";

if (pathName !== `/${folderName}/selectBbsNttList.do`) {
}

function folderCreate(folderName, fileName) {
  fs.readdir(`${folderName}/contents`, (error) => {
    // uploads 폴더 없으면 생성
    if (error) {
      fs.mkdirSync(`${folderName}/contents`, { recursive: true });

      fs.writeFile(`${folderName}/contents/${fileName}.html`, "파일에들어갈내용", function (err) {
        if (err === null) {
          console.log("success");
        } else {
          console.log("fail");
        }
      });
    }
  });
}
