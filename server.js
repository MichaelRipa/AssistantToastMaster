var express = require("express");
var bodyParser = require("body-parser")
var pug = require("pug");
var session = require("express-session");
var app = express();
app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({secret: "e to the pi i equals neg 1", cookie: {maxAge: 3 * 3600000}})); //3 hours 

server = app.listen(3000);

members = [];
eventInfo = {};

app.get(['/','/index.html'],function(req,res){
    res.sendFile(__dirname + "/index.html");
});

app.get('/script.js',function(req,res){
    res.sendFile(__dirname + "/script.js");
});

app.get('/styles.css',function(req,res){
    res.sendFile(__dirname + "/styles.css");
});

app.post('/updateReunion',function(req,res){

    //Update reunion number 
    if(req.body.hasOwnProperty("reunionNumber") == true){
        eventInfo.reunionNumber = req.body.reunionNumber;  
    }
    //Update theme 
    if(req.body.hasOwnProperty("theme") == true){
        eventInfo.theme = req.body.theme;  
    }
    //Update mot de jour
    if(req.body.hasOwnProperty("motDeJour") == true){
        eventInfo.motDeJour = req.body.motDeJour;  
    }

    //Set members array
    if(req.body.hasOwnProperty("members") == true){
        members = req.body.members;
    }

    //Update start time 
    if(req.body.hasOwnProperty("startTime") == true){
        eventInfo.startTime = req.body.startTime;
    }

    //Update end time 
    if(req.body.hasOwnProperty("endTime") == true){
        eventInfo.endTime = req.body.endTime;
    }
    //Set roles that the user chose
    if(req.body.hasOwnProperty("evaluator") == true){
        eventInfo.evaluator = req.body.evaluator;
    }

    //Update added general comments 
    if(req.body.hasOwnProperty("generalNotes")){
        if(eventInfo.hasOwnProperty("generalNotes") == true){
            eventInfo.generalNotes.push(req.body.generalNotes);
        }
        //Creates an array containing "general notes"
        else{
            eventInfo.generalNotes = [req.body.generalNotes];
        } 
       
    }
    
    //Any updates to individual members 
    if(req.body.hasOwnProperty("updateMember")){
        let currentMember = members[req.body.updateMember.id];
        //Ensure id and name match
        if(currentMember.first.trim() == req.body.updateMember.first.trim()){
            
            //Update chronometer time 
            if(req.body.updateMember.hasOwnProperty("chronometer")){
           
                if(currentMember.hasOwnProperty("chronometer") == true){
                    currentMember.chronometer.push(req.body.updateMember.chronometer);
                }
                //Creates an array containing recorded times 
                else{
                    currentMember.chronometer = [req.body.updateMember.chronometer];
                }
              
            }
            //Update hesitation tally 
            if(req.body.updateMember.hasOwnProperty("hesitations")){
              
                if(currentMember.hasOwnProperty("hesitations") == true){
                    currentMember.hesitations += req.body.updateMember.hesitations;
                }
                //Creates a tally of the hesitations 
                else{
                    currentMember.hesitations = 1;
                }

           
             
                
            }
            //Update grammar notes
            if(req.body.updateMember.hasOwnProperty("grammar")){
                
                if(currentMember.hasOwnProperty("grammar") == true){
                    currentMember.grammar.push(req.body.updateMember.grammar);
                }
                //Creates a section containing grammar notes
                else{
                    currentMember.grammar = [req.body.updateMember.grammar];
                }
               
            }
            //Update user notes 
            if(req.body.updateMember.hasOwnProperty("comments")){
              
                if(currentMember.hasOwnProperty("comments") == true){
                    currentMember.comments.push(req.body.updateMember.comments);
                }
                else{
                    currentMember.comments = [req.body.updateMember.comments];
                }
               
            }
        }
    }

    res.status(200).send("OK");

});
app.get('/reunion',function(req,res){
    
    let chronometer;
    let hesitations;
    let grammar;

    //Figure out which roles to add 
    if(eventInfo.evaluator == false){
        chronometer = false;
        hesitations = false;
        grammar = false;
    }
    else{
        //If evaluator is not false, these attributes will be set to boolean values

        chronometer = eventInfo.evaluator.chronometer;
        hesitations = eventInfo.evaluator.hesitations;
        grammar = eventInfo.evaluator.grammar;
    }

    res.render("eventPage.pug",{
        members: members,
        reunionNum: eventInfo.reunionNumber,
        theme: eventInfo.theme,
        motDeJour: eventInfo.motDeJour,
        chronometer: chronometer,
        hesitations: hesitations,
        grammar: grammar
    });
    return;
});

app.get('/compteRendu',function(req,res){

    let chronometer;
    let hesitations;
    let grammar;

    //Figure out which roles to add 
    if((eventInfo.evaluator == false) || (eventInfo.hasOwnProperty("evaluator") == false)) {

        chronometer = false;
        hesitations = false;
        grammar = false;
    }
    else{
        //If evaluator is not false, these attributes will be set to boolean values
        chronometer = eventInfo.evaluator.chronometer;
        hesitations = eventInfo.evaluator.hesitations;
        grammar = eventInfo.evaluator.grammar;
    }

    //Organize information for the chronometer summary
    if(chronometer){
        //eventInfo.duration = getDuration(eventInfo.startTime);
        for(let i = 0; i < members.length; i++){
            if(members[i].hasOwnProperty("chronometer") == true){
                members[i].totalTime =  members[i].chronometer.reduce(function(a, b) {
                    return a + b.duration;
                }, 0);
            }

            else{
                members[i].totalTime = 0;
            }
        }

    }
    //Organize information for the hesitations summary
    if(hesitations){
    
        //Ensure all members have a "hesitations" key
        for(let i = 0 ; i < members.length; i++){
            if(members[i].hasOwnProperty("hesitations") == false){
                members[i].hesitations = 0;
            }
        }

            
        eventInfo.totalHesitations = members.reduce(function(a,b){
            return a + b.hesitations;
        },0);
    }
    
    if(eventInfo.hasOwnProperty("generalNotes") == false){
        eventInfo.generalNotes = [];
    }
  

    res.render("recap.pug",{
        members: members,
        reunionNum: eventInfo.reunionNumber,
        theme: eventInfo.theme,
        motDeJour: eventInfo.motDeJour,
        startTime: eventInfo.startTime,
        chronometer: chronometer,
        hesitations: hesitations,
        totalHesitations: eventInfo.totalHesitations,
        grammar: grammar,
        generalNotes: eventInfo.generalNotes,
        duration: eventInfo.duration
        
    });
});

