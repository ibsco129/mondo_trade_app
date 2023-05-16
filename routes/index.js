const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const BigCommerce = require('node-bigcommerce');

const bigcommerce = new BigCommerce({
  'clientId': 'jkao9fqguhj4r4v8w1wp6z2a4hagj84',
  'accessToken': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
  'storeHash': 'q47bjgus3j',
});

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('trade.db', (err) => {
    if(err){
        console.error(err.message);
    }
    console.log('Connected to the databse');
});
const storage = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, 'public/uploads')
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
});
const upload = multer({ storage });





/* Trade Account page. */
router.get('/', function(req, res, next) {
  res.render('project', { title: 'Trade Account' });
});

/* Front End Trade Account Page */
router.get('/fe-trade-account', function(req,res) {
  res.render('fe_trade_account', {title: 'Front End'});
});


/* Brand Page */
router.get('/brand', async function(req,res){
  // Get Validating Brands from database
  const response = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/catalog/brands', {
    headers:{
      'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
      'Accept': 'application/json'
    }
  });
  const original_brands = response.data.data;

  db.all("SELECT * FROM tbl_brand WHERE visibility=1 ORDER BY brand_id",[],(err, rows)=>{
    var show_array = [];
    for(var i = 0 ; i < rows.length; i++){
      show_array.push(rows[i]['brand_id']);
    }

    db.run('DELETE FROM tbl_brand',(err)=>{
      for(var i = 0 ; i < original_brands.length; i++){
        
        var visi_flag = 0;
        var render_flag = 0;
        if(show_array.includes(parseInt(original_brands[i]['id'])))
          visi_flag = 1;
        
        db.run("INSERT INTO tbl_brand (brand_id,name,url,visibility) VALUES(?,?,?,?)", [original_brands[i]['id'], original_brands[i]['name'], original_brands[i]['custom_url']['url'], visi_flag], (err)=>{
          if( i == original_brands.length){
            if( render_flag == 0){
              res.render('brand',{ title: 'Brands Sort' });
              render_flag = 1;
            }
          }
        });
      }
    });
  });

});



/* Link Project list page */
router.get('/project', function(req,res){
  res.render('project', {title: 'Link to Project list'});
});

/* Link PDF files Page */
router.get('/file-pdf', function(req,res){
  res.render('filepdf',{title: 'Link PDF files'});
});



/* Link 3D models Page */
router.get('/file-model', function(req,res){
  res.render('filemodel',{title:'Link 3D models'});
});

router.get('/case-studies-category', function(req,res){
  res.render('casecategory', {title:'Case Categories'});
});

router.get('/case-studies-list', function(req,res){
  res.render('caselist', {title: 'List'});
});

/*
-------------------------------------------------------
******************     API       **********************
-------------------------------------------------------
*/


////////////////////////// Case Studies   ////////////////////////////////////
router.post('/add_case_project',upload.single('m_image'), (req,res)=>{
  var ajax_data = req.queries;
  console.log(ajax_data);
  var filepath;
  if( (typeof req.file) == 'undefined' ){
      filepath = "";
  }
  else{
      filepath = req.file['filename'];
  }
  console.log(filepath);
  // db.run("INSERT INTO tbl_case_list (name,images,category,details) VALUES (?,?,?,?)", [], (err)=>{
  //   if( err ){
  //     res.send(err.message);
  //   }
  //   else res.send("success");
  // });
});

router.post('/update_case_project',upload.single('m_image'), (req,res)=>{

});

router.post('/get_case_categories', (req,res)=>{
  db.all("SELECT * FROM tbl_case_category",[], (err,rows)=>{
    res.send(rows);
  });
});

router.post('/get_caselist', (req,res)=>{
  db.all("SELECT tbl_case_list.id, tbl_case_list.name, tbl_case_list.images, tbl_case_list.details, tbl_case_category.name as category, tbl_case_category.id as category_id from tbl_case_list LEFT JOIN tbl_case_category on tbl_case_list.category = tbl_case_category.id",[], (err,rows)=>{
    res.send(rows);
  });
});

router.post('/get_categorydata', (req,res)=>{
  db.all("SELECT * FROM tbl_case_category",[], (err,rows) =>{
    res.send(rows);
  });
});

router.post('/add_new_category', (req,res)=>{
  db.run("INSERT INTO tbl_case_category (name) VALUES (?)",["New Category"], (err) =>{
    if( err ){
      res.send(err.message);
    }
    else res.send("success");
  });
});

router.post('/delete_category', (req,res)=>{
  var ajax_data = req.body;
  db.run("DELETE FROM tbl_case_category WHERE id=?",[ajax_data.id], (err)=>{
    if( err ){
      res.send(err.message);
    }
    else res.send('success');
  });
});

router.post('/save_edited_category', (req,res)=>{
  var ajax_data = req.body;
  db.run("UPDATE tbl_case_category SET name=? WHERE id=?",[ajax_data.name, ajax_data.id], (err) =>{
    if( err ){
      res.send(err.message);
    }
    else res.send("success");
  })
});
////////////////////////// Project RFQ List API  /////////////////////////////////
router.post('/register_project', upload.single('file'), async(req,res) => {
  var form_data = req.body;
  
  var filepath;
  if( (typeof req.file) == 'undefined' ){
      filepath = "";
  }
  else{
      filepath = req.file['filename'];
  }
  // Unregistered User
  if( typeof form_data['password'] != 'undefined'){
    const response = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/customers?email:in='+ form_data['email'],{
      headers:{
        'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
        'Accept': 'application/json'
      }
    });
    if( response.data.data.length != 0){
      res.send("duplicated");
      return;
    }
    else{
      res.send("sign_up");
      return;
      bigcommerce.post('/customers',{
        'first_name' : form_data['first_name'],
        'last_name' : form_data['last_name'],
        'email' : form_data['email'],
        'phone' : form_data['phone_number'],
        'addresses': [
          {
            'first_name': form_data['first_name'],
            'last_name' : form_data['last_name'],
            'city' : form_data['location'],
            'country_code': form_data['country'],
            'address1' : form_data['location'],
          }
        ],
        "authentication": {
          "force_password_reset": true,
          "new_password": "String123!@#"
        },
        "customer_group_id": 0,
        "notes": "",
        "tax_exempt_category": "",
        "accepts_product_review_abandoned_cart_emails": true,
        "origin_channel_id": 1,
        "channel_ids": null
      })
      .then(success => {
        console.log("register successed");
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }
  var date = new Date();

  const sql_query = "INSERT INTO tbl_project_rfq (firstname, lastname, email, phone_number, country, location, company, company_url, project_name, project_location,file, message, date_created, date_updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  db.run(sql_query, [form_data['first_name'], form_data['last_name'], form_data['email'], form_data['phone_number'], form_data['country'], form_data['location'], form_data['company'], form_data['company_url'], form_data['project_name'], form_data['project_location'], filepath, form_data['message'], date.toLocaleDateString("en-US"), date.toLocaleDateString("en-US")], function(err){
    if( err ){
      res.send(err.message);
    }
    else res.send("success");
  });
});

router.post("/get_project_rfq_count", function(req,res){
  db.all("SELECT * FROM tbl_project_rfq", [], (err, rows)=>{
    res.send(rows.length + '');
  });
});

router.get("/get_project_rfq_list", (req,res) => {
  var ajax_data = req.query;
  
  if( ajax_data['project_status'] == 'all'){
    db.all("SELECT * FROM tbl_project_rfq ORDER BY date_updated desc ", [], (err, rows) =>{
      if( err ){
        console.log('error', err);
      }
      res.send(rows);
    });
  }
  else{
    db.all("SELECT * FROM tbl_project_rfq WHERE project_status=? ORDER BY date_updated desc", [ajax_data['project_status']], (err, rows) =>{
      if( err ){
        console.log('error', err);
      }
      res.send(rows);
    });
  }
});

router.post("/set_project_status", (req,res) => {
  var ajax_data = req.body;
  const sql_query = "UPDATE tbl_project_rfq SET project_status=? WHERE id=?";
  db.run(sql_query, [ajax_data['project_status'], ajax_data['id']], (err) => {
    if( err ){
      res.send(err.message);
    }
    else res.send("success");
  });
});

router.post("/get_one_project_rfq", (req,res) => {
  var ajax_data = req.body;
  const sql_query = "SELECT * FROM tbl_project_rfq WHERE id=?";
  db.get(sql_query, [ajax_data['id']], (err, row) => {
    if( err ){
      res.send(err.message);
    }
    else res.send(row);
  });
});


//Upload PDF, 3D model files API
router.post('/upload_pdf', upload.single('file'), async(req,res) => {

  var product_id = req.body['id'];
  var filename = req.file.filename;
  const response_file = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/catalog/products/'+product_id+'/custom-fields',{
    headers:{
      'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
      'Accept': 'application/json'
    }
  });
  var field_id = "";
  if( response_file.data.data.length != 0){
    for(var j = 0 ; j < response_file.data.data.length ; j++ ){
      if( response_file.data.data[j]['name'] == "Download"){
        field_id = response_file.data.data[j]['id'];
        break;
      }
    }
  }
  // Create A Custom Field
  if( field_id == ""){
    bigcommerce.post('/catalog/products/'+ product_id +'/custom-fields', {
      'name': 'Download',
      'value' : '[[Specification]]https://820d-45-126-3-252.ngrok-free.app/download?filename=' + filename
    })
    .then(response => {
      res.send("success");
    });
  }
  // Update A Custom Field with field_id
  else {
    bigcommerce.put('/catalog/products/'+ product_id +'/custom-fields/'+ field_id, {
      'name': 'Download',
      'value' : '[[Specification]]https://820d-45-126-3-252.ngrok-free.app/download?filename=' + filename
    })
    .then(response => {
      res.send("success");
    });
  }
});

router.post('/upload_model', upload.single('file'), async(req,res) => {
  var product_id = req.body['id'];
  var filename = req.file.filename;
  const response_file = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/catalog/products/'+product_id+'/custom-fields',{
    headers:{
      'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
      'Accept': 'application/json'
    }
  });
  var field_id = "";
  if( response_file.data.data.length != 0){
    for(var j = 0 ; j < response_file.data.data.length ; j++ ){
      if( response_file.data.data[j]['name'] == "Model"){
        field_id = response_file.data.data[j]['id'];
        break;
      }
    }
  }
  // Create A Custom Field
  if( field_id == ""){
    bigcommerce.post('/catalog/products/'+ product_id +'/custom-fields', {
      'name': 'Model',
      'value' : 'https://820d-45-126-3-252.ngrok-free.app/download?filename=' + filename
    })
    .then(response => {
      res.send("success");
    });
  }
  // Update A Custom Field with field_id
  else {
    bigcommerce.put('/catalog/products/'+ product_id +'/custom-fields/'+ field_id, {
      'name': 'Model',
      'value' : 'https://820d-45-126-3-252.ngrok-free.app/download?filename=' + filename
    })
    .then(response => {
      res.send("success");
    });
  }
});

router.post('/delete_pdf', function(req,res){
  var product_id = req.body['id'];
  var custom_id = req.body['custom_id'];
  bigcommerce.delete('/catalog/products/'+ product_id + '/custom-fields/'+ custom_id)
  .then( response => {
    res.send("success");
  });
});

router.post('/delete_model', function(req,res){
  var product_id = req.body['id'];
  var custom_id = req.body['custom_id'];
  bigcommerce.delete('/catalog/products/'+ product_id + '/custom-fields/'+ custom_id)
  .then( response => {
    res.send("success");
  });
});

// Get Product API
router.post('/get_total_count', async function(req,res){
  const response = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/catalog/products',{
    headers:{
        'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
        'Accept': 'application/json'
    }
  });
  total_count = response.data.meta.pagination.total
  res.send(total_count+'');
});

router.get('/get_products', async function(req,res){
  var queries = req.query;
  var return_data = [];
  var response;
  if( typeof queries['filtervalue0'] == 'undefined'){
    response = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/catalog/products?page='+(parseInt(queries['pagenum'])+1)+'&limit='+queries['pagesize'],{
      headers:{
          'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
          'Accept': 'application/json'
      }
    });
  }
  else{
    response = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/catalog/products?name:like='+ queries['filtervalue0'] +'&page='+(parseInt(queries['pagenum'])+1)+'&limit='+queries['pagesize'],{
      headers:{
          'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
          'Accept': 'application/json'
      }
    });
  }
  var products = response.data.data;
  for( var i = 0; i < products.length; i++ ){
    var response_img = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/catalog/products/'+products[i]['id']+'/images',{
      headers:{
          'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
          'Accept': 'application/json'
      }
    });
    if( response_img.data.data.length != 0 )
      var img = response_img.data.data[0]['url_standard'];
    else var img = "";
    
    var response_file = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/catalog/products/'+products[i]['id']+'/custom-fields',{
      headers:{
          'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
          'Accept': 'application/json'
      }
    });
    var file = "", model = "";
    var file_id = 0 , model_id = 0;
    if( response_file.data.data.length != 0){
      for(var j = 0 ; j < response_file.data.data.length ; j++ ){
        if( response_file.data.data[j]['name'] == "Download"){
          file = response_file.data.data[j]['value'];
          file_id = parseInt(response_file.data.data[j]['id']);
        }
        else if( response_file.data.data[j]['name'] == "Model")
          model = response_file.data.data[j]['value'];
          model_id = parseInt(response_file.data.data[j]['id']);
      }
    }

    var json_array = {
      'id' : products[i]['id'],
      'image' : img,
      'name' : products[i]['name'],
      'file' : file,
      'file_id' : file_id,
      'model' : model,
      'model_id': model_id
    };
    return_data.push(json_array);
  }
  res.send(return_data);

});
// Brand API
router.get('/get_branddata', function(req, res){
  db.all("SELECT * FROM tbl_brand", [], (err,rows) =>{
    res.send(rows);
  });
});
router.post('/get_totalbrand', function(req,res){
  db.all("SELECT * FROM tbl_brand",[], (err,rows) =>{
    res.send(rows.length + '');
  });
});
router.post('/update_brand', function(req,res){
	var edit_id = req.body['id'];
  var visible_flag ;
	db.get('select * from tbl_brand where id=?',[edit_id], (err,row)=>{
    visible_flag = row['visibility'];
    db.run("UPDATE tbl_brand SET visibility=? WHERE id=?",[1-visible_flag,edit_id]);
    res.send("success");
  });
});
//Store Front Brand API
router.post('/get_brands_footer', function(req,res){
  db.all("SELECT name as brand_name, url as brand_url FROM tbl_brand WHERE visibility=1",[],(err,rows)=>{
    res.send(rows);
  });
});

// Trade Account API
router.get('/get_userdata', function( req, res){
  db.all("SELECT * from tbl_users",[],(err,rows) =>{
    res.send(rows);
  })
});
// Create Account API
router.post('/create-account',upload.single('file'), async(req,res)=> {
  var data = req.body; // Form Data
  var filepath;
  if( (typeof req.file) == 'undefined' ){
      filepath = "";
  }
  else{
      filepath = req.file['filename'];
  }
  const response = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/customers?email:in='+data['email'],{
          headers:{
              'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
              'Accept': 'application/json'
          }
      });
  custom_info = response.data.data;
  
  //Guest Mode
  if( (typeof data['password'] != 'undefined')){
      
      if( custom_info.length != 0 ){
          res.send("need_login");
          return;
      }
      else{
          const sql = `INSERT OR REPLACE INTO tbl_users(firstname, lastname, location, phone_number, email, password, country_code, occupation, company, company_url, attachment, project_description) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;
          const result = await db.run(sql,[data['firstname'],data['lastname'],data['location'],data['phone_number'],data['email'],data['password'],data['country'],data['occupation'],data['company'],data['company_url'],filepath,data['description']]);
          res.send("success");
      }
  }
  //Customer Mode
  else{
      const sql = `INSERT OR REPLACE INTO tbl_users(firstname, lastname, location, phone_number, email, password, country_code, occupation, company, company_url, attachment, project_description) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;
      db.run(sql, [data['firstname'],data['lastname'],data['location'],data['phone_number'],data['email'],data['password'],data['country'],data['occupation'],data['company'],data['company_url'],filepath,data['description']]);
      res.send("success");
  }
  
});




module.exports = router;
