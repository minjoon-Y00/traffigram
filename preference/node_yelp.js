'use strict';

const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const compression = require('compression');
const yelp = require('yelp-fusion');

const port = 2999;
const clientId = 'YbrQpXXmE1UKSUEMMm8ErQ';
const clientSecret = 'DKozFyLfqRXKELKWDteJAoaR7r9SbwoAxBpLI0UyVhkhlPmezob67tYPWL5VsUtB';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(compression());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const server = http.createServer(app);

server.listen(port, function(){
	console.log("Yelp Server listening on: " + port);
});

app.post('/yelpSearch', (req, res) => {
	let str = '/yelpSearch : ';
	str += req.body.term + ' ';
	str += req.body.lat + ' ';
	str += req.body.lng + ' ';
	str += req.body.radius;

  console.log(str);

	const searchRequest = {
	  term: req.body.term, //'food',
	  latitude: req.body.lat, //40.72946,
	  longitude: req.body.lng, //-73.995708,
	  sort_by: "rating",
	  radius: req.body.radius, //10000
	};

	yelp.accessToken(clientId, clientSecret)
	.then(response => {
	  const client = yelp.client(response.jsonBody.access_token);

	  client.search(searchRequest)
	  .then(response => {

	    const result = response.jsonBody.businesses;
	    res.jsonp(parse(result));
	    //res.jsonp(result);
	    //const prettyJson = JSON.stringify(firstResult, null, 4);
	    //console.log(prettyJson);
	  });
	}).catch(e => {
	  console.log(e);
	  res.status(500).send('yelp error.');
	});
});

function parse(results) {
	let out = [];
	
	for(let ret of results) {
		let obj = {
			lat: ret.coordinates.latitude, 
			lng: ret.coordinates.longitude,
			phone: ret.display_phone,
			dist: ret.distance,
			imge_url: ret.image_url,
			name: ret.name,
			price: ret.price,
			rating: ret.rating,
			review_count: ret.review_count,
			url: ret.url,
		};

		// categories
		if (ret.categories.length > 0) {
			obj.categories = ret.categories[0].title;
			for(let i = 1; i < ret.categories.length; i++) {
				obj.categories += ', ' + ret.categories[i].title;
			}
		}
		else {
			obj.categories = '';
		}

		// address
		if (ret.location.display_address.length > 0) {
			obj.address = ret.location.display_address[0];
			for(let i = 1; i < ret.location.display_address.length; i++) {
				obj.address += ', ' + ret.location.display_address[i];
			}
		}
		else {
			obj.address = '';
		}

		out.push(obj);
	}
	return out;
}


/*
Object
categories
:
Array[2]
0
:
Object
alias
:
"mideastern"
title
:
"Middle Eastern"
__proto__
:
Object
1
:
Object
alias
:
"falafel"
title
:
"Falafel"
__proto__
:
Object
length
:
2
__proto__
:
Array[0]
coordinates
:
Object
latitude
:
40.7172485
longitude
:
-73.9448511
__proto__
:
Object
display_phone
:
"(718) 383-0550"
distance
:
4495.26964292
id
:
"pita-palace-brooklyn"
image_url
:
"https://s3-media1.fl.yelpcdn.com/bphoto/9_1lWgPhI6Zg-N5tUpwbbg/o.jpg"
is_closed
:
false
location
:
Object
address1
:
"413 Graham Ave"
address2
:
""
address3
:
""
city
:
"Brooklyn"
country
:
"US"
display_address
:
Array[2]
0
:
"413 Graham Ave"
1
:
"Brooklyn, NY 11211"
length
:
2
__proto__
:
Array[0]
state
:
"NY"
zip_code
:
"11211"
__proto__
:
Object
name
:
"Pita Palace"
phone
:
"+17183830550"
price
:
"$"
rating
:
5
review_count
:
130
transactions
:
Array[0]
url
:
"https://www.yelp.com/biz/pita-palace-brooklyn?adjust_creative=YbrQpXXmE1UKSUEMMm8ErQ&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=YbrQpXXmE1UKSUEMMm8ErQ"
__proto__
:
Object
*/

