const express = require('express')
const app = express()
const server = require('http').createServer(app);
const bodyparser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const {v4:uuidv4} = require('uuid');
const bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload');
const path = require('path');
const Admin = require('./models/admin');
const uploadImage = require('./function/ImageUpload.js');

const port = process.env.PORT || 3000;

mongoose.connect(`mongodb+srv://xxxxxx:xxxxxx@clusteriot.h9pwp.mongodb.net/Restuarant?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('Database connection successful');
    server.listen(port, () => console.info(`listening on port ${port}`));
})
.catch(err => {
    console.error('Database connection error: ' + err);
});

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extened: true}));
app.use(fileUpload());

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));
app.use("/css" , express.static(__dirname + "public/css"));
app.use("/js" , express.static(__dirname + "public/js"));
app.use("/img" , express.static(__dirname + "public/img"));
app.set('views', "./views");
app.set('view engine', 'ejs');

app.get('/admin', async (req, res) => { 
    res.render("admin"); 
});

app.get('/dashboard', async (req, res) => {
    if(req.session.user){
        res.render("dashboard"); 
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.get('/setting', async (req, res) => {   
    if(req.session.user){
        res.render("setting"); 
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});


app.post('/admin', async (req, res) => {    
    Admin.findOne({
        email: req.body.email
    }, (err, result) => {
        if(result && !err){
            var temp = bcrypt.compareSync(req.body.pass,result.password);
            if(temp){
                req.session.user = result.id;
                res.redirect("dashboard");
            }else{
                res.render("admin", {flag: "Invalid Username/Password"});
            }
        }else{
            res.render("admin", {flag: "User Does Not Exist"});
        }
    });
});

app.get('/admin/logout', async (req, res) => {    
    if(req.session.user){
        req.session.user = undefined;
        res.render("admin", {flag: "Logged out"});
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.get('/restaurant/:id', async (req, res) => {  
    Admin.findOne({ restname: req.params.id}, (err, result) => { 
        if (err || !result) {
            console.log(err);
            res.render("index", {data:""});
        } else {
            res.render("index", {data: JSON.stringify(result.settings)} );
        } 
    })
});

app.get('/api/admin', async (req, res) => {   
    if(req.session.user){
        Admin.findOne({ id: req.session.user}, (err, result) => { 
            if (err || !result) {
                console.log(err);
            } else {
                res.json(result.settings);
            } 
        })
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.get('/edit-menu', async (req, res) => {
    if(req.session.user){
        res.render("edit-menu"); 
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.post('/update/menu/:id', (req, res) => {    
    if(req.session.user){
        var newavailablity = req.body.available ? true : false;
        if(req.files){
            var image_name = uploadImage(req.files.image,__dirname);

            Admin.updateOne(
                {id: req.session.user},
                {
                    $set: {
                        "settings.menu.$[filterOne].name": req.body.name,
                        "settings.menu.$[filterOne].desc": req.body.desc, 
                        "settings.menu.$[filterOne].cate": req.body.cate, 
                        "settings.menu.$[filterOne].price": req.body.price,
                        "settings.menu.$[filterOne].availablty": newavailablity,
                        "settings.menu.$[filterOne].img": image_name
                    }
                },
                {
                    arrayFilters:[
                        {
                            "filterOne.id": req.params.id
                        }
                    ]
                },
            function(err, result){
                if(!err && result){
                    res.redirect('/edit-menu');
                }else{
                    console.log("Error: " + err);
                    res.redirect('/edit-menu');
                }
            });
            
        }else{
            Admin.updateOne(
                {id: req.session.user},
                {
                    $set: {
                        "settings.menu.$[filterOne].name": req.body.name,
                        "settings.menu.$[filterOne].desc": req.body.desc, 
                        "settings.menu.$[filterOne].cate": req.body.cate, 
                        "settings.menu.$[filterOne].price": req.body.price,
                        "settings.menu.$[filterOne].availablty": newavailablity
                    }
                },
                {
                    arrayFilters:[
                        {
                            "filterOne.id": req.params.id
                        }
                    ]
                },
             function(err, result){
                if(!err && result){
                    res.redirect('/edit-menu');
                }else{
                    console.log("Error: " + err);
                    res.redirect(500,'/edit-menu');
                }
            });
        }
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.post('/delete/menu/:id', async (req, res) => {
    if(req.session.user){
        Admin.updateOne({id: req.session.user},
                {
                    $pull: { 
                        "settings.menu": { 
                            id: req.params.id 
                        } 
                    } 
                },
            function(err, result){
                if(!err && result){
                    res.redirect('/edit-menu');
                }else{
                    console.log("Error: " + err);
                    res.redirect(500,'/edit-menu');
                }
        });
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.post('/add/menu/', async (req, res) => {   
    if(req.session.user){
        var image_name = "";

        if(req.files){
            image_name = uploadImage(req.files.image,__dirname);
        }

        var newavailablity = req.body.available ? true : false;

        Admin.updateOne({id: req.session.user},
            {
                $push: { 
                    "settings.menu": { 
                        id: uuidv4(),
                        name: req.body.name,
                        desc: req.body.desc,
                        cate: req.body.cate,
                        price: req.body.price,
                        availablty: newavailablity,
                        img: image_name
                    } 
                } 
            },
         function(err, result){
            if(!err && result){
                res.redirect('/edit-menu');
            }else{
                console.log("Error: " + err);
                res.redirect(500,'/edit-menu');
            }
        });
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});


app.post('/add/category/', async (req, res) => {     
    if(req.session.user){
         Admin.updateOne({id: req.session.user},
            {
                $push: { 
                    "settings.category": { 
                        id: uuidv4(),
                        name: req.body.name,
                    } 
                } 
            },
         function(err, result){
            if(!err && result){
                res.redirect('/edit-menu');
            }else{
                console.log("Error: " + err);
                res.redirect(500,'/edit-menu');
            }
        });
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.post('/delete/category', async (req, res) => { 
    if(req.session.user){
        Admin.updateOne({id: req.session.user},
            {
                $pull: { 
                    "settings.category": { 
                        name: req.body.cate 
                    } 
                } 
            }, 
        function(err, result){
            if(!err && result){
                res.redirect('/edit-menu');
            }else{
                console.log("Error: " + err);
                res.redirect(500,'/edit-menu');
            }
    });
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});


app.post('/settings/resturant', async (req, res) => { 
    if(req.session.user){
        console.log(req.body.name);
        Admin.updateOne({id: req.session.user},
            {
                $set: { 
                    "settings.theme.rest_name": req.body.name
                } 
            },
        function(err, result){
            if(!err && result){
                res.redirect('/setting');
            }else{
                console.log("Error: " + err);
                res.redirect(500,'/setting');
            }
        });
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.post('/settings/theme/logo', async (req, res) => { 
    if(req.session.user){
        var logoImage;
        if(req.files){
            logoImage = uploadImage(req.files.logo,__dirname);
            Admin.updateOne({id: req.session.user},
                {
                    $set: { 
                        "settings.theme.logo": logoImage
                    } 
                },
             function(err, result){
                if(!err && result){
                    res.redirect('/setting');
                }else{
                    console.log("Error: " + err);
                    res.redirect(500,'/setting');
                }
            });
        }else{
            res.redirect('/setting');
        }
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.post('/settings/theme/background', async (req, res) => { 
    if(req.session.user){
        var bckgrdImage;
        if(req.files){
            bckgrdImage = uploadImage(req.files.bckgrd,__dirname);
            Admin.updateOne({id: req.session.user},
                {
                    $set: { 
                        "settings.theme.bckground": bckgrdImage
                    } 
                },
             function(err, result){
                if(!err && result){
                    res.redirect('/setting');
                }else{
                    console.log("Error: " + err);
                    res.redirect(500,'/setting');
                }
            });
        }else{
            res.redirect('/setting');
        }
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});

app.post('/settings/theme/colors', async (req, res) => { 
    if(req.session.user){
        Admin.updateOne({id: req.session.user},
            {
                $set: {
                    "settings.theme.color_one": req.body.colOne,
                    "settings.theme.color_two": req.body.colTwo
                } 
            },
         function(err, result){
            if(!err && result){
                res.redirect('/setting');
            }else{
                console.log("Error: " + err);
                res.redirect(500,'/setting');
            }
    });
    }else{
        res.render("admin", {flag: "Session Ended"});
    }
});


/** <APP DESCRIPTION>
 * This a customizable menu template for every restuarant that
 * is easy to use by business owners
 */

/** <APP FEATURES>
 * 1. render menu on home page
 * 2. load menu items from db
 * 3. create sign page to admin page
 * 4. admin features
 *      - add/update/remove/disable items from menu
 *      - receive order from customers (realtime)
 *      - change menu theme
 * 5. users features
 *      - veiw menu itmes
 *      - send orders and recive check (realtime)
 */

// Create user
// const admin = new Admin({
//     id: uuidv4(),
//     name: "Restuarnt Admin",
//     restname: "mcd",
//     email: "admin@rest.com",
//     password: "admin",
//     settings: {
//         theme:{
//             rest_name: "mcd",
//             logo: "logo.png",
//             bckground: "blurred_bg2.jpg",
//             color_one: "#ff0000",
//             color_two: "#000080"
//         },
//         category: [
//             {
//                 id: uuidv4(),
//                 name: "dinner"
//             },
//             {
//                 id: uuidv4(),
//                 name: "breakfast"
//             },
//             {
//                 id: uuidv4(),
//                 name: "drinks"
//             }
//         ],
//         menu:[
//             {
//                 id: uuidv4(),
//                 name: "pizza",
//                 desc: "best food ever",
//                 cate: "dinner",
//                 price: "22",
//                 availablty: true,
//                 img: "Untitled design (33)"
//             },
//             {
//                 id: uuidv4(),
//                 name: "laksa",
//                 desc: "best food ever",
//                 cate: "breakfast",
//                 price: "22",
//                 availablty: true,
//                 img: "Untitled design (33)"
//             },
//             {
//                 id: uuidv4(),
//                 name: "tyaz",
//                 desc: "best food ever",
//                 cate: "drinks",
//                 price: "22",
//                 availablty: true,
//                 img: "Untitled design (33)"
//             }
//         ]
//     }
// });
// admin.save()
