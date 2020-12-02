const fs = require("fs");

const txtData = fs.readFileSync(`${__dirname}/location.txt`).toString();
const states = [
  "Alabama",
  "Alaska",
  "American Samoa",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District Of Columbia",
  "Federated States Of Micronesia",
  "Florida",
  "Georgia",
  "Guam",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Marshall Islands",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Northern Mariana Islands",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Palau",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virgin Islands",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];
const filepath = `${__dirname}/location.json`;

function usStateCount() {
  const stateCountResult = {};

  states.forEach((state) => {
    let reg = new RegExp(state, "g");
    stateCountResult[state] = (txtData.match(reg) || []).length;
  });
  if(fs.existsSync(filepath)){
    fs.unlinkSync(filepath);
  }
  // Create empty file
  fs.writeFile(filepath, "", { flag: "wx" }, function (err) {
    if (err) throw err;
  });
  fs.appendFileSync(filepath, JSON.stringify(stateCountResult))
}

usStateCount();
