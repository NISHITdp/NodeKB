const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

//Check connection
db.once('open',function(){
  console.log('Connected to MongoDB');
})

//Check for db errors
db.on('error', function(err){
  console.log(err);
})

//INIT APP
const app = express();

//Bring in models
let Article = require('./models/article');

//LOAD VIEW ENGINE
app.set('views',path.join(__dirname, 'views'));
app.set('view engine','pug');

//Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//set Public folder
app.use(express.static(path.join(__dirname, 'public')));

//Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));

//Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express validator middleware
/*app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root    = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));*/

//HOME ROUTE
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    }else{
      res.render('index',{
        title: 'Articles',
        articles: articles
      });
    }
  });
});

//get single article
app.get('/article/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('article',{
      article: article
    });
  });
});

//Add ROUTE
app.get('/articles/add', function(req, res){
  res.render('add_article', {
    title:'Add Articles'
  });
});

//add submit post ROUTE
app.post('/articles/add',function(req, res){
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(function(err){
    if(err){
      console.log(err);
      return;
    } else{
      req.flash('success','ARTICLE ADDED');
      res.redirect('/');
    }
  });
});

//Load edit form
app.get('/article/edit/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    res.render('edit_article',{
      title:'Edit Article',
      article: article
    });
  });
});

//Update submit post route
app.post('/articles/edit/:id',function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else{
      req.flash('success','ARTICLE UPDATED');
      res.redirect('/');
    }
  });
});

app.delete('/article/:id', function(req, res){
  let query = {_id:req.params.id}

  Article.remove(query, function(err){
    if(err){
      console.log(err);
    } else {
      res.send('Success');
    }
  });
});

//START SERVER
app.listen(3000, function(){
  console.log('Server started on port 3000...');
})
