const fs = require("fs");
const filepath = `${__dirname}/number.csv`;
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const totalPage = 8; //2013001 // 2020120

puppeteer.launch({ headless: false }).then(function (browser) {
  browser.newPage().then(function (page) {
    page.goto("http://www.cwl.gov.cn/kjxx/ssq/kjgg/").then(async function () {
      const pageData = await page.evaluate(async () => {
        document.querySelector(".zdy").click(); 
        document.querySelectorAll("Strong")[1].click();
        document.querySelector(".inpQa").value = "2013001";
        document.querySelector(".inpQz").value = "2020120";
        document.querySelector(".anKs.aQzQ").click();
      });

      doFetch(1);
      async function doFetch(ii) {
        if (ii > totalPage) {
          return;
        }
        const pageData = await page.evaluate(
          async ({ ii }) => {
            console.log(ii);
            function delay(time) {
              return new Promise(function (resolve) {
                setTimeout(resolve, time);
              });
            }
            document.querySelector(`li[class="xye"]`).click();
            await delay(500);
            return document.querySelector("body").innerHTML;
          },
          { ii }
        );
        await parseDom(pageData);
        ii += 1;
        doFetch(ii);
      }
    });
  });
});

async function parseDom(dom) {
  try {
    let count = 0;
    let columnCount = 13;
    $ = cheerio.load(dom);
    $("td:not([colspan]):not([rowspan]):not([width])").each(async (i, ele) => {
      let content = $(ele).text();
      if (!content) {
        let link = $(ele).find("a").attr("href"); // (i - 16) / 13 === 0
        if (link) {
          content = link;
          // content = retrieveLocationData(link);
        }
      }
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
    // async function retrieveLocationData(link) {
    //   await linkPage.goto(link, { waitUntil: "networkidle0" });
    //   const pageData = await linkPage.evaluate(async () => {
    //     function delay(time) {
    //       return new Promise(function (resolve) {
    //         setTimeout(resolve, time);
    //       });
    //     }
    //     delay(2000);
    //     return document.querySelector(".zjqkzy dd").innerHTML;
    //   });
    //   return pageData;
    // }
    return;
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

let headerFlag = false;
if (!headerFlag) {
  fs.appendFileSync(
    filepath,
    "期号,开奖日期,红球,蓝球,总销售额（元）,1注数,1中奖金额（元）,2注数,2中奖金额（元）,3注数,3中奖金额（元),奖池（元),详情"
  );
  headerFlag = true;
}
