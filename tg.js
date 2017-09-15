const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const db = require('mysql');
const bodyParser = require('body-parser');

const port = 4349;

// Access-Control-Allow-Origin
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(express.static('.'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

//https
const options = {
  key: fs.readFileSync('pem/key.pem'),
  ca: fs.readFileSync('pem/intermediate.pem'),
  cert: fs.readFileSync('pem/cert.pem')
};

const server = https.createServer(options, app);

server.listen(port, function(){
	console.log("[HTTPS] Server listening on: " + port);
});

// DB connection
const dbPool = db.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'Show4time!',
  database : 'traffigram',
  connectionLimit : 1000,
});


// APIs
app.post('/signup_check', function(req, res){
  console.log('/signup_check : ' + req.body.user_id);
 
  dbPool.getConnection(function(err, con) {
    if (err) throw err;
    signup_check(req, res, con);
  });
});

app.post('/signup', function(req, res){
  console.log('/signup : ' + req.body.user_id + ' ' + req.body.user_pw + ' ' + 
   req.body.user_name + ' ' + req.body.user_home + ' ' + req.body.user_home_lng + ' ' + 
   req.body.user_home_lat + ' ' + req.body.user_office + ' ' + req.body.user_office_lng + 
   ' ' + req.body.user_office_lat);
 
  dbPool.getConnection(function(err, con) {
    if (err) throw err;
    signup(req, res, con);
  });
});

app.post('/sign_in', function(req, res){
  console.log('/sign_in : ' + req.body.user_id + ' ' + req.body.user_pw);
 
  dbPool.getConnection(function(err, con) {
    if (err) throw err;
    sign_in(req, res, con);
  });
});

app.post('/tod_get_cat', function(req, res){
  console.log('/tod_get_cat');
 
  dbPool.getConnection(function(err, con) {
    if (err) throw err;
    tod_get_cat(req, res, con);
  });
});

app.post('/reset_addresses', function(req, res){
  console.log('/reset_addresses : ' + req.body.user_id);
 
  dbPool.getConnection(function(err, con) {
    if (err) throw err;
    reset_addresses(req, res, con);
  });
});

app.post('/dest_detail', function(req, res){
  console.log('/dest_detail : ' + req.body.dest_id);
 
  dbPool.getConnection(function(err, con) {
    if (err) throw err;
    dest_detail(req, res, con);
  });
});

app.post('/save_favorite', function(req, res){
  console.log('/save_favorite : ' + req.body.user_id);
 
  dbPool.getConnection(function(err, con) {
    if (err) throw err;
    save_favorite(req, res, con);
  });
});

app.post('/save_log', function(req, res){
  console.log('/save_log : ' + req.body.user_id);
 
  dbPool.getConnection(function(err, con) {
    if (err) throw err;
    save_log(req, res, con);
  });
});



function signup_check(req, res, con) {
  const sql = 'SELECT * FROM traffigram_users WHERE user_id = "' + 
    req.body.user_id + '"';
  con.query(sql, function(err, r) {
    if (err) { console.log(err); res.jsonp({res: false});}
    
    if (r.length === 0) res.jsonp({res: true});
    else res.jsonp({res: false});
    con.release();
  });
}

function signup(req, res, con) {
  let sql = 'SELECT * FROM traffigram_users WHERE user_id = "' + 
    req.body.user_id + '"';
  con.query(sql, function(err, r) {
    if (err) { console.log(err); res.jsonp({res: false});}
    
    if (r.length !== 0) {
      res.jsonp({res: false});
      con.release();
    } 
    else {
      sql = 'INSERT INTO traffigram_users (user_id, user_pw, user_name, user_home, ' + 
        'user_home_lng, user_home_lat, user_office, user_office_lng, user_office_lat) ' + 
        'VALUES ("' + req.body.user_id + '", "' + req.body.user_pw + '", "' + 
        req.body.user_name + '","' + req.body.user_home + '","' + req.body.user_home_lng +
        '","' + req.body.user_home_lat + '","' + req.body.user_office + '","' + 
        req.body.user_office_lng + '","' + req.body.user_office_lat +'")';

      con.query(sql, function(err, r) {
        if (err) { console.log(err); res.jsonp({res: false});}
        
        res.jsonp({res: true});
        con.release();
      });
    }
  });
}

function sign_in(req, res, con) {
  const sql = 'SELECT user_id, user_name, user_home, user_home_lng, user_home_lat, user_office,' +
    ' user_office_lng, user_office_lat, user_fav FROM traffigram_users' + 
    ' WHERE user_id = "' + req.body.user_id + '" AND user_pw = "' + 
    req.body.user_pw + '"';
  con.query(sql, function(err, r) {
    if (err) { console.log(err); res.jsonp({res: false});}
    
    if (r.length === 1) {
      res.jsonp({
        res: true, user_id: r[0].user_id, user_name: r[0].user_name, user_home: r[0].user_home,
        user_home_lng: r[0].user_home_lng, user_home_lat: r[0].user_home_lat,
        user_office: r[0].user_office, user_office_lng: r[0].user_office_lng,
        user_office_lat: r[0].user_office_lat, user_fav: r[0].user_fav
      });
    } 
    else {
      res.jsonp({res: false});
    }
    con.release();
  });
}

function tod_get_cat(req, res, con) {
  const sql = 'SELECT * FROM traffigram_cat';
  con.query(sql, function(err, r) {
    if (err) { console.log(err); res.jsonp({res: false});}

    const categories = 
      ["Restaurant", "Cafe", "Travel Attractions", "Shopping", "Night Life"];
    let cat_array = [];

    for(let i = 0; i < categories.length; i++) {
      cat_array.push({cat_name: categories[i], cat_id: i + 1, cat_sub: []});
    }

    for(let ret of r) {
      const main_id = parseInt(ret.cat_id.split('_')[0]);
      cat_array[main_id - 1].cat_sub.push({
        cat_name: ret.cat_name, cat_id: ret.cat_id, cat_num: ret.cat_num,
        cat_img: ret.cat_img});
    }
    res.jsonp({cat: cat_array});
    con.release();
  });
}

function reset_addresses(req, res, con) {
  let sql = 'SELECT id FROM traffigram_users WHERE user_id = "' + 
    req.body.user_id + '"';

  con.query(sql, function(err, r) {
    if (err) { console.log(err); res.jsonp({res: false});}
    
    if (r.length === 1) {
      sql = 'UPDATE traffigram_users SET user_home = "' + req.body.user_home + 
        '", user_home_lng = "' + req.body.user_home_lng + '", user_home_lng = "' + 
        req.body.user_home_lng + '", user_home_lat = "' + req.body.user_home_lat + 
        '", user_office = "' + req.body.user_office +  '", user_office_lng = "' + 
        req.body.user_office_lng + '", user_office_lat = "' + req.body.user_office_lat + 
        '" WHERE user_id = "' + req.body.user_id + '"';
      con.query(sql, function(err, r) {
        if (err) { console.log(err); res.jsonp({res: false});}

        res.jsonp({res: true});
        con.release();
      });
    }
    else {
      res.jsonp({res: false});
      con.release();
    }
  });
}

function save_favorite(req, res, con) {
  let sql = 'SELECT id FROM traffigram_users WHERE user_id = "' + 
    req.body.user_id + '"';

  con.query(sql, function(err, r) {
    if (err) { console.log(err); res.jsonp({res: false});}
    
    if (r.length === 1) {
      sql = "UPDATE traffigram_users SET user_fav = '" + req.body.user_fav + 
        "' WHERE user_id = '" + req.body.user_id + "'";
      console.log(sql);
      con.query(sql, function(err, r) {
        if (err) { console.log(err); res.jsonp({res: false});}

        res.jsonp({res: true});
        con.release();
      });
    }
    else {
      res.jsonp({res: false});
      con.release();
    }
  });
}

function dest_detail(req, res, con) {
  let sql = 'SELECT * FROM traffigram_dest WHERE dest_id ="' + req.body.dest_id + '"';

  con.query(sql, function(err, r) {
    if (err) { console.log(err); res.jsonp({detail: false});}

    if (r.length === 0) {
      res.jsonp({detail: false});
    }
    else {
      const loc = {id: r[0].id, dest_id: r[0].dest_id, dest_price_range: r[0].dest_price_range, 
        dest_price: r[0].dest_price, dest_rating: r[0].dest_rating, 
        dest_rating_cnt: r[0].dest_rating_cnt, dest_url_mobile: r[0].dest_url_mobile,
        dest_url: r[0].dest_url, dest_name: r[0].dest_name, dest_cat: r[0].dest_cat, 
        dest_cats: r[0].dest_cats, dest_cat_id: r[0].dest_cat_id, 
        dest_info_phone: r[0].dest_info_phone, dest_info_address: r[0].dest_info_address, 
        dest_info_city: r[0].dest_info_city, dest_info_zip: r[0].dest_info_zip, 
        dest_lat: r[0].dest_loc_lat, dest_lng: r[0].dest_loc_lng, dest_imgs: r[0].dest_imgs,
        dest_highlights: r[0].dest_highlights, dest_fullrev: r[0].dest_fullrev, 
        dest_hours: r[0].dest_hrs};
      res.jsonp({detail: loc});
    }
    con.release();
  });
}

function save_log(req, res, con) {
  //console.log(req.body);  

  let sql = 'SELECT * FROM traffigram_log WHERE user_id = "' + req.body.user_id + 
    '" AND date = "' + req.body.date + '" AND type = "' + req.body.type + '"';

  con.query(sql, function(err, r) {
    if (err) { console.log(err); res.jsonp({res: false}); con.release();}

    // insert new log
    if (r.length === 0) {
      sql = "INSERT INTO traffigram_log (user_id, date, type, duration, zoom, pan, origin, " +
        "tot, iso, custom_iso, filter, detail, nav, switching) VALUES ('" + 
        req.body.user_id + "', '" + req.body.date + "', '" + req.body.type + "', '" + 
        req.body.duration + "', '" +
        req.body.zoom + "', '" + req.body.pan + "', '" + req.body.origin + "', '" + 
        req.body.tot + "', '" + req.body.iso + "', '" + req.body.custom_iso + "', '" + 
        req.body.filter + "', '" + req.body.detail + "', '" + req.body.nav + "', " + 
        parseInt(req.body.switching) + ")";
      //console.log(sql);

      con.query(sql, function(err, r) {
        if (err) { console.log(err); res.jsonp({res: false});}
        res.jsonp({res: true});
        con.release();
      });
    }
    // update current log
    else {

      let duration = JSON.parse(r[0].duration);
      let zoom = JSON.parse(r[0].zoom);
      let pan = JSON.parse(r[0].pan);
      let origin = JSON.parse(r[0].origin);
      let tot = JSON.parse(r[0].tot);
      let iso = JSON.parse(r[0].iso);
      let custom_iso = JSON.parse(r[0].custom_iso);
      let filter = JSON.parse(r[0].filter);
      let detail = JSON.parse(r[0].detail);
      let nav = JSON.parse(r[0].nav);
      let switching = r[0].switching;

      const inDuration = JSON.parse(req.body.duration);
      const inZoom = JSON.parse(req.body.zoom);
      const inPan = JSON.parse(req.body.pan);
      const inOrigin = JSON.parse(req.body.origin);
      const inTot = JSON.parse(req.body.tot);
      const inIso = JSON.parse(req.body.iso);
      const inCustomIso = JSON.parse(req.body.custom_iso);
      const inFilter = JSON.parse(req.body.filter);
      const inDetail = JSON.parse(req.body.detail);
      const inNav = JSON.parse(req.body.nav);
      const inSwitching = JSON.parse(req.body.switching);

      duration.WM += inDuration.WM;
      duration.DC += inDuration.DC;
      duration.List += inDuration.List;
      zoom.WM += inZoom.WM;
      zoom.DC += inZoom.DC;
      pan.WM += inPan.WM;
      pan.DC += inPan.DC;
      origin.WM += inOrigin.WM;
      origin.DC += inOrigin.DC;
      tot.WM += inTot.WM;
      tot.DC += inTot.DC;
      iso.DC += inIso.DC;
      custom_iso.DC += inCustomIso.DC;
      filter.WM += inFilter.WM;
      filter.DC += inFilter.DC;
      detail.WM += inDetail.WM;
      detail.DC += inDetail.DC;
      nav.WM += inNav.WM;
      nav.DC += inNav.DC;
      switching += inSwitching;

      duration = JSON.stringify(duration);
      zoom = JSON.stringify(zoom);
      pan = JSON.stringify(pan);
      origin = JSON.stringify(origin);
      tot = JSON.stringify(tot);
      iso = JSON.stringify(iso);
      custom_iso = JSON.stringify(custom_iso);
      filter = JSON.stringify(filter);
      detail = JSON.stringify(detail);
      nav = JSON.stringify(nav);

      sql = "UPDATE traffigram_log SET duration = '" + duration + "', zoom = '" + zoom +
        "', pan = '" + pan + "', origin = '" + origin + "', tot = '" + tot + 
        "', iso = '" + iso + "', custom_iso = '" +  custom_iso + "', filter = '" +
        filter + "', detail = '" + detail + "', nav = '" + nav + "', switching = " +
        switching + " WHERE user_id = '" + req.body.user_id + 
        "' AND date = '" + req.body.date + "'";  

      //console.log(sql);

      con.query(sql, function(err, r) {
        if (err) { console.log(err); res.jsonp({res: false}); con.release();} 

        res.jsonp({res: true});
        con.release();
      });
    }
  });
}







