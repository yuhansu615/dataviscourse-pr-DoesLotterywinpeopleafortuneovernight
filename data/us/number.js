const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");
const filepath = "./number.csv";

function sendRequest() {
  const options = {
    hostname: "www.txlottery.org",
    port: 443,
    path:
      "/export/sites/lottery/Games/Mega_Millions/Winning_Numbers/index.html_2013354932.html",
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  let result = "";
  const req = https.request(options, (res) => {
    res.on("data", (chunk) => {
      result += chunk;
    });
    res.on("end", () => {
      parseDom(result);
    });
  });
  req.on("error", (e) => {
    console.error(`problem with request: ${e.message}`);
  });
  req.end();
}

let headerFlag = false;
function parseDom(dom) {
  let count = 0;
  let columnCount = 7
  $ = cheerio.load(dom);
  if (!headerFlag) {
    fs.appendFileSync(filepath, "year,numbers,specialNumber,megaplier,EstimatedJackpot,JackpotWinners");
    headerFlag = true;
  }
  $("td").each((i, ele) => {
    if (count === columnCount || count === 0) {
      fs.appendFileSync(filepath, "\r\n");
      count = 0;
    }
    let content = $(ele).text();
    // if (count === 6) {
    //   // 移除後面六個用來描述開出順序的數字
    //   content = content.slice(0, 0);
    // }
    if(!content.match(/First Drawing/g)) {
      fs.appendFileSync(filepath, `${count !== 0 ? "," : ""}${content.replace(/,/g, "")}`);
      count += 1;
    }
  });
  // if (reqPageNum < totalPageCount) {
  //   reqPageNum += 1;
  //   sendRequest(reqPageNum);
  // }
}

if(fs.existsSync(filepath)){
  fs.unlinkSync(filepath);
}
// Create empty file
fs.writeFile(filepath, "", { flag: "wx" }, function (err) {
  if (err) throw err;
});
sendRequest();
