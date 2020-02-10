const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const MongoStore = require('connect-mongo')(session);
const exphbs = require('express-handlebars');
const moment = require('moment-timezone');
const dotenv = require('dotenv').config();
const compression = require('compression');
const sharp = require('sharp');

sharp("public/images/N-YHS_BHM_vert_Bill_Graham2.png")
  .resize(1024,331)
  .toFile("public/images/nyhsbg.png", (error, info) => {
    if(error) console.log(error);
  });

const altru = {
  "dates": `${process.env.ALTRU_BASE}${process.env.ALTRU_QUERY_DATES}`,
  "tixsold": `${process.env.ALTRU_BASE}${process.env.ALTRU_QUERY_SOLD}`,
  "times": `${process.env.ALTRU_BASE}${process.env.ALTRU_QUERY_TIMES}`,
  "tixtypes": `${process.env.ALTRU_BASE}${process.env.ALTRU_QUERY_TIXTYPES}`
}

const app = express();
app.use(compression());
app.set("views");
const hbs = exphbs.create({
  defaultLayout: 'main'
});
app.engine('handlebars', hbs.engine);
app.set("view engine", "handlebars");

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true}));

app.use(session({
    secret: require('crypto').randomBytes(64).toString('hex'),
    store: new MongoStore({ url: `mongodb://${process.env.MONGO_USER}:${encodeURIComponent(process.env.MONGO_PW)}@${process.env.MONGO_URL}`}),
    resave: false,
    saveUninitialized: true
}));

var router = express.Router();

app.get("/", function (request, response) {
  let openingDate = new moment("2020-2-14","YYYY-M-D");
  let testDate = new moment("2020-2-20","YYYY-M-D");
  let todaysDate = new moment();
  let startDate = todaysDate.isAfter(openingDate) ? todaysDate : openingDate;
  let requestedDate = moment(request.query.date,"YYYY-M-D", true).isValid() ? request.query.date : startDate.format("YYYY-M-D");
  const datesAvailable = getAltruData([altru.dates,altru.tixtypes]);
  datesAvailable.then(res => {
    let dateArray = res[0];
    let tixTypes = res[1];
    let allDates = {};
    let dDateArray = [true];
    dateArray.map(d => {
      let tDate = moment(d.date);
      dDateArray.push([tDate.year(),tDate.month(),tDate.date()]);
    });
    allDates["enable"] = dDateArray;
    response.render('index', {
      disabledDates: JSON.stringify(allDates),
      tixType: tixTypes,
      webformUrl: process.env.ALTRU_WEBFORM_BASE,
      requestedDate: requestedDate
    });
  });
});
app.get("/gettimes", function(request, response) {
  let date = request.query.d;
  let month = request.query.m;
  let year = request.query.y;
  let requestedDate = `${year}-${parseInt(month) + 1}-${date}`;
  const timesAvailable = getAltruData([altru.times,altru.tixsold]);
  timesAvailable.then(res => {
    let timesResult = res[0];
    let tixResult = res[1];
    const tixSold = {};
    tixResult.map(sold => {
      tixSold[sold.eventid] = sold.tixsold;
    });
    let requested =  [];
    timesResult.map(e => {
      if(moment(e.startdate).format("YYYY-M-D") == requestedDate) {
        let timeSlot = {
          "event_id": e.eventid,
          "time": moment(e.starttime, "HH:mm").format("h:mm a")
        }
        let id = e.eventid;
        if(id in tixSold) {
          let capacity = parseInt(e.capacity);
          let sold = parseInt(tixSold[id]);
          let left = capacity - sold;
          if(left == 0) {
            timeSlot["left"] = "Sold Out";
          }
          else if(left <= 20) {
            timeSlot["left"] = `${left} Left`;
          }
          else {
            timeSlot["left"] = false;
          }
        }
        requested.push(timeSlot);
      }
    });
    if(requested.length > 0) {
      response.render("times",{"timeslot": requested, layout: false});
    } else {
      response.render("notimes",{layout: false});
    }
  });
});
async function getAltruData(urlsArray) {
  let odataOptions = {
    headers: {
      'Authorization': "Basic " + process.env.AUTH_STRING,
      'accept': 'application/json'
    },
      method: 'GET',
      muteHttpExceptions: true,       
  }
  
  let odataCallback = (error, response, body) => {
    if(!error) {
      let bodyParse = JSON.parse(body);
      let bodyArray = bodyParse.value;
      return bodyArray;
    }
  }
  let odataUrl = process.env.ODATA_URL_EVENTS;  
  let odataUrl2 = process.env.ODATA_URL_SOLD;  
  const finalObj = {};
  const altruData = await Promise.all(urlsArray.map(url => fetch(url, odataOptions)
    .then(results => results.json()) )).then(json => {
        const jsonFinal = json.map(j => j.value.map(item => {
          delete item.QUERYRECID;
          return item;
        }));
        return jsonFinal;
  });
  return altruData;
}
app.get("/faq", function (request, response) {
  response.render("faq");
});
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
