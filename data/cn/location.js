const http = require("http");
const cheerio = require("cheerio");
const fs = require("fs");
const filepath = "./location.csv";
let i = 0;
(async () => {
  const csvFilePath = `${__dirname}/number.csv`;
  const csv = require("csvtojson");
  const csvData = await csv().fromFile(csvFilePath);
  const links = csvData.map((item) =>
    item.detail.replace("http://www.cwl.gov.cn/", "")
  );
  console.log(links);
  await sendRequest(links[i]);

  function sendRequest(url) {
    if (i > links.length) {
      return;
    }
    const options = {
      hostname: "www.cwl.gov.cn",
      port: 80,
      path: url,
      method: "GET",
    };

    let result = "";
    const req = http.request(options, (res) => {
      res.on("data", (chunk) => {
        result += chunk;
      });
      res.on("end", () => {
        i += 1;
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
    try {
      $ = cheerio.load(dom);
      if (!headerFlag) {
        fs.appendFileSync(filepath, "year,prizes,full_prizes\r\n");
        headerFlag = true;
      }
      const issueNum = $(`td[colspan="3"]`).text();
      const numResult = $(".zjqkzy").text();
      let c = numResult.replace(/[\s,]/g, "");
      let filteredC = /：(.+)/.exec(c) && /：(.+)/.exec(c)[1].replace(/[,]。.+/g, "");
      // /：(.+)/.exec(c)[1].replace(/。.+/g, '')
      fs.appendFileSync(filepath, issueNum + ",");
      fs.appendFileSync(filepath, filteredC + ",");
      fs.appendFileSync(filepath, c);
      fs.appendFileSync(filepath, "\r\n");
      sendRequest(links[i]);
    } catch (err) {
      console.log(err);
    }
  }

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
  // Create empty file
  fs.writeFile(filepath, "", { flag: "wx" }, function (err) {
    if (err) throw err;
  });
})();
