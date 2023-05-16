const express = require('express');
const router = express.Router();
const BigCommerce = require('node-bigcommerce');
const multer = require('multer');
const axios = require('axios');

const bigCommerce = new BigCommerce({
    secret: '5535c9f998b221adb2d4fe3e49a8383f63fca23de9e08436dd0bf61847322353',
    responseType: 'json'
});

router.get('/', (req, res, next) => {
    res.render('project', { title: 'Dashboard'});
});

// router.post('/getuserdata', (req,res) =>{

//     var query = "SELECT * from tbl_users ";
//     var data = req.body;
//     if(data['search[value]'] != ""){
//         var search_key = data['search[value]'];
//         query = query + "WHERE id LIKE '%" + search_key + "%'";
//         for(var i = 1 ; i < 13 ; i++){
//             query  = query + " OR " + data['columns['+i+'][data]'] + " LIKE '%" + search_key + "%'";
//         }
//     }
//     var order_index = data['order[0][column]'];
//     query = query + " ORDER BY " + data['columns['+order_index+'][data]']+ " " + data['order[0][dir]'];
//     query = query + " LIMIT " + data['length'] + " OFFSET " + data['start'];

//     var return_data = {};
//     var count, filtered_data, filtered_cnt;
//     db.get("select count(*) as cnt from tbl_users", (error, row) =>{        
//         count = row['cnt'];
//         db.all(query,[],(err,rows) =>{
//             filtered_data = rows;
//             filtered_cnt = rows.length;
//             return_data['draw'] = data['draw'];
//             return_data['recordsTotal'] = count;
//             return_data['recordsFiltered'] = filtered_cnt;
//             return_data['data'] = filtered_data;
//             res.send(return_data);
//         });
//     });
// });

// router.get('/test', (req,res,next) => {
//     res.render('trade_account');
// })
// router.post('/create-account',upload.single('file'), async(req,res)=> {
//     var data = req.body; // Form Data
//     var filepath;
//     if( (typeof req.file) == 'undefined' ){
//         filepath = "";
//     }
//     else{
//         filepath = req.file['filename'];
//     }
//     const response = await axios.get('https://api.bigcommerce.com/stores/q47bjgus3j/v3/customers?email:in='+data['email'],{
//             headers:{
//                 'X-Auth-Token': '79kimifs5l7l7dnuoyjgxy6l3i7rei1',
//                 'Accept': 'application/json'
//             }
//         });
//     custom_info = response.data.data;
    
//     //Guest Mode
//     if( (typeof data['password'] != 'undefined')){
        
//         if( custom_info.length != 0 ){
//             res.send("need_login");
//             return;
//         }
//         else{
//             const sql = `INSERT OR REPLACE INTO tbl_users(firstname, lastname, location, phone_number, email, password, country_code, occupation, company, company_url, attachment, project_description) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;
//             const result = await db.run(sql,[data['firstname'],data['lastname'],data['location'],data['phone_number'],data['email'],data['password'],data['country'],data['occupation'],data['company'],data['company_url'],filepath,data['description']]);
//             res.send("success");
//         }
//     }
//     //Customer Mode
//     else{
//         const sql = `INSERT OR REPLACE INTO tbl_users(firstname, lastname, location, phone_number, email, password, country_code, occupation, company, company_url, attachment, project_description) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;
//         db.run(sql, [data['firstname'],data['lastname'],data['location'],data['phone_number'],data['email'],data['password'],data['country'],data['occupation'],data['company'],data['company_url'],filepath,data['description']]);
//         res.send("success");
//     }
    
// });

module.exports = router;