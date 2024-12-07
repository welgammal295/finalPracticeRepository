import express from 'express';
import mysql from 'mysql2/promise';


const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));


//setting up database connection pool
const pool = mysql.createPool({
    host: "walid-elgammal.online",
    user: "walidelg_webuser1",
    password: "cst-336",
    database: "walidelg_comicsdb",
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection();

//routes
app.get("/", async function(req, res) {
    let sql = `SELECT * 
               FROM fe_comic_sites 
               ORDER BY comicSiteName`;
    const [rows] = await conn.query(sql);

    let sql2 = `SELECT comicUrl, comicSiteName
                FROM fe_comics
                NATURAL JOIN fe_comic_sites
                ORDER BY RAND() LIMIT 1`;
    const [rows2] = await conn.query(sql2);

    res.render("index", { "comics": rows, "image": rows2 });
});

// This is used for the API - use the same name of the route 
app.get("/api/random-comic", async function (req, res) {
    // Fetch a random comic
    let sql = `SELECT *
                FROM fe_comics
                NATURAL JOIN fe_comic_sites
                ORDER BY RAND() LIMIT 1`;
    const [rows] = await conn.query(sql);
    res.json(rows[0]);
});

// combined both the button and the form for dropdown _ do not render same distnation 
app.get("/comic/new", async function (req, res) {
    let sql = `SELECT DISTINCT comicSiteName
               FROM fe_comic_sites
               ORDER BY comicSiteName ASC`;
    const [rows] = await conn.query(sql);
    res.render("addComic", { "websites": rows });
});

// Post new comic from the form
app.post("/comic/new", async function (req, res) {

    let comicTitle = req.body.comicTitle;
    let url = req.body.url;
    let comicSiteName= req.body.comicSiteName;
    let comicDate = req.body.comicDate;
    let sql1 = `SELECT * 
                FROM fe_comic_sites 
                ORDER BY comicSiteName`;
    const [rows1] = await conn.query(sql1);
    let sql2= `SELECT comicSiteId
                        FROM fe_comic_sites
                        WHERE comicSiteName = ?`;
    const [rows2] = await conn.query(sql2, [comicSiteName]); // this is how we are going to cross from one tabel to another. 
    let comicSiteId = rows2[0].comicSiteId;
    let sql = `INSERT INTO fe_comics
               (comicUrl, comicSiteId, comicTitle, comicDate)
               VALUES (?, ?, ?, ?)`;
    let params = [url, comicSiteId, comicTitle, comicDate]  
    const [rows] = await conn.query(sql, params);
    res.render("addComic", {message: "Comic Added!", websites: rows1});
});

// This is a good route that allows a page to get info 
// then render it to a new page comic.
app.get('/comicInfo', async(req, res)=>{
    let comicName = req.query.comicName;
    let sql = `SELECT *
                FROM fe_comics
                NATURAL JOIN fe_comic_sites
                WHERE comicSiteName = "${comicName}" `;
    const [rows] = await conn.query(sql);
    res.render("comic",{"comicbyname":rows, comicName});
});

// Web API
app.get('/api/comment/:id', async (req, res) => {
    let comicId = req.params.id;
    let sql = `SELECT * 
               FROM fe_comments
               WHERE comicId = ?`;
    let [rows] = await conn.query(sql, [comicId]);
    res.send(rows);
});

app.get('/add-comment', async (req, res) => {
    let comicId = req.query.comicId;
    let sql = `SELECT * 
               FROM fe_comics
               WHERE comicId = ?`;
    const [rows] = await conn.query(sql, [comicId]);
    res.render("addComment", {"comicComment": rows});
});

app.post('/add-comment', async (req, res) => {
    let comicId = req.body.comicId;
    let username = req.body.username;
    let emailAdd = req.body.emailAdd;
    let commentText = req.body.commentText;

    let sql = `INSERT INTO fe_comments
                (comicId, author, email, comment)
                VALUE (?, ?, ?, ?)`;
    let params = [comicId, username, emailAdd, commentText];
    const [rows] = await conn.query(sql, params);
    let sql1 = `SELECT *
                FROM fe_comics`;
    const [rows1] = await conn.query(sql1);

    res.render("addComment", {message: "Comic Added!", "comicComment": rows1});
});


app.get("/dbTest", async(req, res) => {
let sql = "SELECT CURDATE()";
const [rows] = await conn.query(sql);
res.send(rows);
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})