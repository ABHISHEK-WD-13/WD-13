var express          = require("express"),
     mongoose        = require("mongoose"),
     MethodOverride  = require("method-override"),
    request          = require("request"), 
    http             = require("http"),
    bodyparser       = require("body-parser"),
    app              = express(),
    passport         = require("passport"),
    localpassport    = require("passport-local"),
    localmongoosepassport = require("passport-local-mongoose");
   
    
    server        = http.createServer(app);
    app.set('view engine', 'ejs');
    

    mongoose.connect("mongodb://localhost:27017/our_talks", {useNewUrlParser: true,
  useUnifiedTopology: true });
  mongoose.set('useCreateIndex', true);
    app.use(MethodOverride("_method"));
    app.use( express.static( "public" ) );
    app.use(bodyparser.urlencoded({extended: true}));
    app.use(require("express-session")({
        secret : "learning authenticaton",
        resave:false,
        saveUninitialized:false
        }));
        
    app.use(passport.initialize());
    app.use(passport.session());
   
    var commentSchema = new mongoose.Schema({
        comment : {type : String , default : "ANNONYMOUS"}  ,
        username : String
    });
    var Comment = mongoose.model("Comment" , commentSchema);

    var storiesSchema= new mongoose.Schema({
        
        name: String, 
        title : String,
        image: String,
        story : String ,
        comments: [commentSchema],
        likes :  Number ,
        created : { type : Date , default: Date.now}
    });

    var Stories = mongoose.model("Stories" , storiesSchema);

    
    // Stories.findByIdAndRemove()
    //  Stories.create(stories);
    var i=0;
//============================================================================================
    
    //=================================================================================

    app.get("/", function(req, res){

        Stories.find({} , function(err , allstories){
            if(req.user){
                i=1;
                if(i===1){ 
    for(var j=0 ; j<allstories.length ; j++){
       var like  = { title : allstories[j].title , liked : false};

        req.user.like.push(like);
        
        
    }
    req.user.save();
  
    res.render("index.ejs" , {user : req.user});
    i=0;
}else{console.log(i);
   
    res.render("index.ejs" , {user : req.user});
}

            }else{
                res.render("index.ejs" , {user : req.user});
            }


        });
       
    });

    
//=============================================================
    //user model 
//=============================================================

var userSchema = new mongoose.Schema({
    username:String,
    password : String , 
    like : [{
        title : String , liked : { type : Boolean , default : false }

    }]
    // comments: [commentSchema]
});

userSchema.plugin(localmongoosepassport);
var User = mongoose.model("User" , userSchema);
passport.use(new localpassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// User.create({
//     username : "abhisheklamba",
//     password : "abhishek"
// });



// User.findOne({"username" : "abhisheklamba"} , function(err , founduser){
//     if(err){
//         console.log("error");
//     }else {
// founduser.comments.push({
//             comment : "i like it",
//             username : "abhishek"
//         });        
//         founduser.save();
//         console.log(founduser);
//     }
// });

  //============
  //signup page 
  //============
  app.get("/signup" , function(req , res){
    res.render("sign_up.ejs");
      });
    app.post("/signup" , function(req , res){
       User.register(new User({username : req.body.username}) , req.body.password , function(err , user){
         if(err){
             console.log("error");
             return res.redirect("/signup");
         }
         passport.authenticate("local")(req , res , function(){
             i=1;
         res.redirect("/");
         });
       }) ;
    });

    app.get("/login" , function(req , res){
 res.render("log_in.ejs");
    });

    app.post("/login" , passport.authenticate("local", {successRedirect : "/" ,failureRedirect : "/login"} )
    , function(req , res){
        i=1;
        console.log(i);
        
    }); 
    app.get("/logout" , function(req , res ){
        i=0;
        req.logout();
        res.redirect("/");
    });
    function isloggedin(req , res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect("/login");
    }
//=============================================================
//user model ends
//=============================================================



// Stories.create({
//     name : "ABHISHEK",
//     title : "error error error",
//     story : "Deleted all my blogs because of so many errors.Starting again now .Hope this time i will suerly do this."
// })




app.get("/photogallery", function(req, res){
res.render("photo_gallery.ejs" , {user : req.body.user});
});

app.get("/addstory" , isloggedin ,function(req, res){
    res.render("addstory.ejs");
});

app.get("/mystories" ,  function(req, res){
    
 Stories.find({} , function(err , allstories){
 if(err){
     console.log("error!!!")
 }else {
    //  console.log(allstories);
    res.render("mystories.ejs", {stories : allstories, user :req.body.user });
 }
 });
});



app.post("/mystories", isloggedin , function(req , res){
    var newname = req.body.name , newstory = req.body.story , newtitle = req.body.title , newimage = req.body.image;
    
    var newstory = { name: newname , title: newtitle , story: newstory , image : newimage  , likes : 0 };
    
   Stories.create(newstory);
  
   var like = {
       title : newtitle , liked :false 
   }
   req.user.like.push(like);
   req.user.save();
//    console.log(newstory);
    res.redirect("/mystories");
});

app.get("/mystories/:id", function(req , res){
    Stories.findById(req.params.id , function(err , foundstory){
        if(err){ console.log(req.params.id);
            console.log(err);
        }else {
            if(req.user){
           
                var array = req.user.like;
               
               
                var index = array.findIndex(x => x.title === foundstory.title);
                
    
              
                res.render("show.ejs" , {story : foundstory , user : req.user , index : index} );

            }
            else {
                res.render("show.ejs" , {story : foundstory , user : req.user } );
            }
            // stories.findById(req.params.id , function(err , foundstory))
           
        }
    })
  
});
app.get("/mystories/:id/edit", isloggedin , function(req , res){
    Stories.findById(req.params.id  , function(err , foundstory){
       if(err){
           console.log("oops error");
       }else {
        res.render("edit.ejs" , {story : foundstory});
       }
    });
  
});

app.put("/mystories/:id" , function(req , res){
    Stories.findByIdAndUpdate(req.params.id ,  req.body.story  , function(err , foundstory){
if(err){
    res.redirect("/mystories");
}else{
    res.redirect("/mystories/" + foundstory._id);
}
    });
  
  });
  

  //==================
  //comments
  //==================
 app.post("/mystories/:id/comment" , isloggedin , function(req , res){
Stories.findById(req.params.id , function(err , foundstory){
    if(err){
        console.log("error here");
    }else { 
        var newcomment = { username : req.user.username , comment : req.body.comment};
        foundstory.comments.push(newcomment);
        foundstory.save();
        res.redirect("/mystories/" + req.params.id );
    }
    

});
 });
  //like route

 
  app.post("/mystories/:id/like" , function(req , res){

Stories.findById(req.params.id , function(err , foundstory){

if(err){
    console.log("oops error");
}else{

    var array = req.user.like ;
    var index = array.findIndex(x => x.title === foundstory.title);
   
    var like =foundstory.likes;
   
    
    if(req.user.like[index].liked){ 
     
        foundstory.likes = like-1;
        
        req.user.like[index].liked = false;
        foundstory.save();
        req.user.save();
        res.redirect("/mystories/" + req.params.id);
    }else{
        foundstory.likes = like+1;
       
        req.user.like[index].liked = true;
        foundstory.save();
        req.user.save();
        res.redirect("/mystories/" + req.params.id);
    }

} 
});




  });


 

    server.listen(process.env.PORT,process.env.IP);
server.on('listening', function() {
    console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});


