'use strict';

const yelp = require('yelp-fusion');

// Place holders for Yelp Fusion's OAuth 2.0 credentials. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const clientId = 'YbrQpXXmE1UKSUEMMm8ErQ';
const clientSecret = 'DKozFyLfqRXKELKWDteJAoaR7r9SbwoAxBpLI0UyVhkhlPmezob67tYPWL5VsUtB';

const searchRequest = {
  term:'food',
  latitude: 40.72946,
  longitude: -73.995708,
  radius: 10000
};

yelp.accessToken(clientId, clientSecret).then(response => {
  const client = yelp.client(response.jsonBody.access_token);

  client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses;
    const prettyJson = JSON.stringify(firstResult, null, 4);
    console.log(prettyJson);
  });
}).catch(e => {
  console.log(e);
});