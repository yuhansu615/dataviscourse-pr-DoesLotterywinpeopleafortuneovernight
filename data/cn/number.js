// const http = require("http");
// const cheerio = require("cheerio");
// const fs = require("fs");
// const filepath = "./number.csv";

// function sendRequest() {
//   const options = {
//     hostname: "www.cwl.gov.cn",
//     path:
//       "/cwl_admin/kjxx/findDrawNotice?name=ssq&issueCount=&issueStart=&issueEnd=&dayStart=1998-07-22&dayEnd=2020-12-01&pageNo=2",
//     method: "GET",
//     headers: {
//       "X-Requested-With": "XMLHttpRequest",
//       "Accept": "application/json, text/javascript, */*; q=0.01",
//       "Host": "www.cwl.gov.cn",
//       "Cookie": "Sites=_21; UniqueID=SPRv5Fm8xyVXWJqX1606204251230; _ga=GA1.3.1394658040.1606204253; bdshare_firstime=1606204629201; _gid=GA1.3.837391998.1606801276; 21_vq=20",
//       "Content-Type": "application/json;charset=UTF-8",
//     },
//   };

//   let result = "";
//   const req = http.request(options, (res) => {
//     res.on("data", (chunk) => {
//       console.log(chunk)
//       result += chunk;
//     });
//     res.on("end", () => {
//       console.log(result)
//       parseDom(result);
//     });
//   });
//   req.on("error", (e) => {
//     console.error(`problem with request: ${e.message}`);
//   });
//   req.end();
// }

// let headerFlag = false;
// function parseDom(dom) {
//   console.log(dom)
//   $ = cheerio.load(dom);
//   if (!headerFlag) {
//     fs.appendFileSync(filepath, "year,numbers,specialNumber,megaplier,EstimatedJackpot,JackpotWinners");
//     headerFlag = true;
//   }
// }

// if(fs.existsSync(filepath)){
//   fs.unlinkSync(filepath);
// }
// // Create empty file
// fs.writeFile(filepath, "", { flag: "wx" }, function (err) {
//   if (err) throw err;
// });
// sendRequest();
const fs = require("fs");
const filepath = "./number.csv";
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
puppeteer.launch({ headless: true }).then(function (browser) {
  browser.newPage().then(function (page) {
    page.goto("http://www.cwl.gov.cn/kjxx/ssq/kjgg/").then(async function () {
      const pageData = await page.evaluate(async () => {
        function delay(time) {
          return new Promise(function (resolve) {
            setTimeout(resolve, time);
          });
        }
        document.querySelector(".zdy").click(); //2013001 // 2020120
        document.querySelectorAll("Strong")[1].click();
        document.querySelector(".inpQa").value = "2013001";
        document.querySelector(".inpQz").value = "2020120";
        document.querySelector(".anKs.aQzQ").click();
        await delay(500);
        return document.querySelector("body").innerHTML;
      });
      // console.log(pageData)
      parseDom(pageData);
    });
  });
});

let headerFlag = false;
async function parseDom(dom) {
  try {
    //console.log(dom)
    const linkBrowser = await puppeteer.launch({ headless: true });
    const linkPage = await linkBrowser.newPage();
    let count = 0;
    let columnCount = 13;
    $ = cheerio.load(dom);
    if (!headerFlag) {
      fs.appendFileSync(
        filepath,
        "期号,开奖日期,红球,蓝球,总销售额（元）,1注数,1中奖金额（元）,2注数,2中奖金额（元）,3注数,3中奖金额（元),奖池（元),详情"
      );

      $("td:not([colspan])").each(async (i, ele) => {
        // .getAttribute('href')
        let content = $(ele).text();
        if (!content) {
          let link = $(ele).find("a").attr("href"); // (i - 16) / 13 === 0
          if (link) {
            content = link;
            // content = retrieveLocationData(link);
          }
        }
        console.log(i);
        console.log(content);
        if (count === columnCount || count === 0) {
          fs.appendFileSync(filepath, "\r\n");
          count = 0;
        }
        fs.appendFileSync(
          filepath,
          `${count !== 0 ? "," : ""}${content.replace(/[,\s]/g, "")}`
        );
        count += 1;
      });
      async function retrieveLocationData(link) {
        await linkPage.goto(link, { waitUntil: "networkidle0" });
        const pageData = await linkPage.evaluate(async () => {
          function delay(time) {
            return new Promise(function (resolve) {
              setTimeout(resolve, time);
            });
          }
          delay(2000);
          return document.querySelector(".zjqkzy dd").innerHTML;
        });
        return pageData;
      }

      headerFlag = true;
    }
  } catch (err) {
    console.log(err);
    return;
  }
}

if (fs.existsSync(filepath)) {
  fs.unlinkSync(filepath);
}
// Create empty file
fs.writeFile(filepath, "", { flag: "wx" }, function (err) {
  if (err) throw err;
});
