const express = require('express');
const app = express();
const https = require('https');
const path = require('path');
const axios = require('axios').default;
const fs = require('fs');
const ejsMate = require('ejs-mate')

let i = 0;
let len = 0;
let score = 0;
let correctAns = [];
// laet chos enOptions = [];
let questions = [];
let questionObject = [];
var bodyParser = require('body-parser');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// const quizData;
///GET FOR HOME PAGE

app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function reset() {
    i = 0;
    len = 0;
}
app.get('/', (req, res) => {
    // res.send("Hii!!!!");
    res.render('home.ejs');
})

function clearOldData() {
    i = 0;
    score = 0;
    correctAns = [];
    // laet chos enOptions = [];
    questions = [];
    questionObject = [];

}
//POST FOR HOME PAGE
app.post('/', (req, res) => {
    // console.log(req.body);
    var { category, quenumber, level } = req.body;
    let cat = '';
    len = quenumber;
    if (typeof category === 'string' || category instanceof String) {
        cat = category;
    } else {
        for (let i of category) {
            // console.log(i);
            cat = cat.concat(",", i.toLowerCase());
        }
        cat = cat.substring(1);
    }

    // let ques;
    console.log(cat);
    axios.get('https://the-trivia-api.com/api/questions', {
            params: {
                categories: cat,
                limit: quenumber,
                difficulty: level,
                region: "IN"
            }
        })
        .then(function(response) {
            // console.log("In responce")

            const { data } = response;
            clearOldData();
            // console.log("In responce")
            const dataJSON = JSON.stringify(data);
            // console.log("In responce")
            fs.writeFileSync('data.json', dataJSON);
            // console.log("In responce")

            res.redirect('quiz');
        })
        .catch(function(error) {
            console.log('error');
        })
})


app.get("/quiz", (req, res) => {
    const fs = require('fs');
    // console.log("in if");
    fs.readFile('data.json', (err, d) => {
        if (err) throw err;

        let data = JSON.parse(d);

        if (i < len) {
            // console.log("in if");
            let q = data[i].question;
            let options = [];
            options.push(data[i].correctAnswer);
            options.push(data[i].incorrectAnswers[0]);
            options.push(data[i].incorrectAnswers[1]);
            options.push(data[i].incorrectAnswers[2]);
            correctAns.push(data[i].correctAnswer);
            options.sort();
            // console.log("R = ", r);
            let info = {
                question: q,
                options: options,
                last: false,
                correctOpt: data[i].correctAnswer
            }
            questionObject.push(info);

            i++;
            // console.log("In Quiz");
            res.render('quiz.ejs', { info });
        }


    });
})

app.post("/quiz", (req, res) => {
    const { Choosen_opt } = req.body;
    // console.log(Choosen_opt);
    // console.log(len, i);
    questionObject[i - 1]["chosenOption"] = Choosen_opt;
    if (Choosen_opt === questionObject[i - 1].correctOpt) {
        score += 1;
        // console.log(score);
    }
    if (i === parseInt(len)) {
        res.redirect('/result');
    } else {
        res.redirect('/quiz');
    }
})

app.get('/result', (req, res) => {
    // console.log(questionObject);
    var obj = {};
    obj.data = questionObject;
    obj.score = score;
    // console.log(obj);
    res.render('result.ejs', { obj: obj });
})

app.listen(3000, () => {
    console.log("LISTNING ON PORT 3000");
})


// axios.get('https://the-trivia-api.com/api/questions', { params: { categories: 'science', limit: '2', region: 'IN', difficulty: 'easy' } })
//         .then((r) => {
//             // console.log(r.data);
//             // return r.data;
//             const { questions } = r.data;
//             req.render('quiz.ejs', { questions });

//         })
//         .catch(() => {
//             console.log("Eroor");
//         })