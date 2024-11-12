import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";

const app = express();
const port = 4000; // Choose a single port for both the API and the frontend
const API_URL = `http://localhost:${port}`;
const key = "LQjp5EKc1ZW9eCbx9RjcZTm3WYBo7M6gvmuf83J4Dpbuk0WYWdlf8pcu";

let quotes = [
    {
        "id": 1,
        "quote": "The only limit to our realization of tomorrow is our doubts of today.",
        "person": "Franklin D. Roosevelt",
        "year": 1939,
        "context": "Encouragement during economic hardships"
    },
    {
        "id": 2,
        "quote": "In the end, we will remember not the words of our enemies, but the silence of our friends.",
        "person": "Martin Luther King Jr.",
        "year": 1965,
        "context": "Civil rights movement"
    },
    {
        "id": 3,
        "quote": "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        "person": "Winston Churchill",
        "year": 1941,
        "context": "During World War II"
    },
    {
        "id": 4,
        "quote": "It is our choices that show what we truly are, far more than our abilities.",
        "person": "J.K. Rowling",
        "year": 1999,
        "context": "Interview about the Harry Potter series"
    },
    {
        "id": 5,
        "quote": "Life is what happens when you're busy making other plans.",
        "person": "John Lennon",
        "year": 1980,
        "context": "Personal reflections on life"
    },
    {
        "id": 6,
        "quote": "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        "person": "Nelson Mandela",
        "year": 1994,
        "context": "Inauguration speech as president of South Africa"
    },
    {
        "id": 7,
        "quote": "The way to get started is to quit talking and begin doing.",
        "person": "Walt Disney",
        "year": 1955,
        "context": "Advice on business and creativity"
    },
    {
        "id": 8,
        "quote": "Don't watch the clock; do what it does. Keep going.",
        "person": "Sam Levenson",
        "year": 1970,
        "context": "Inspiration for perseverance"
    },
    {
        "id": 9,
        "quote": "You miss 100% of the shots you don’t take.",
        "person": "Wayne Gretzky",
        "year": 1983,
        "context": "Advice on taking risks"
    },
    {
        "id": 10,
        "quote": "If you look at what you have in life, you’ll always have more.",
        "person": "Oprah Winfrey",
        "year": 2000,
        "context": "Speech on gratitude and positivity"
    }
]


let lastId = quotes.length;

// Middleware for parsing requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Set up view engine
app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// API ROUTES
app.get("/quotes", (req, res) => res.json(quotes));
app.get("/quotes/:id", (req, res) => {
    const quote = quotes.find((q) => q.id === parseInt(req.params.id));
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.json(quote);
});
app.post("/quotes", (req, res) => {
    if (!req.body.quote || !req.body.author) return res.status(400).json({ message: "Quote and author are required" });
    const newId = ++lastId;
    const quote = { id: newId, quote: req.body.quote, person: req.body.author };
    quotes.push(quote);
    res.json(quote);
});
app.patch("/quotes/:id", (req, res) => {
    const findQuote = quotes.find((q) => q.id === parseInt(req.params.id));
    if (!findQuote) return res.status(404).json({ message: "Post not found" });
    if (req.body.quote) findQuote.quote = req.body.quote;
    if (req.body.author) findQuote.person = req.body.author || "Unknown";
    res.json(findQuote);
});
app.delete("/quotes/:id", (req, res) => {
    const index = quotes.findIndex((q) => q.id === parseInt(req.params.id));
    if (index !== -1) {
        quotes.splice(index, 1);
        res.status(201).json({ message: `Quote with id ${req.params.id} deleted` });
    } else res.status(404).json({ message: `No quote with id ${req.params.id}` });
});

// FRONTEND ROUTES
app.get("/", async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/quotes`);
        const quotes = response.data;
        const ranPage = Math.floor(Math.random() * 10) + 1;
        const imgRes = await axios.get(`https://api.pexels.com/v1/search?query=nature&per_page=${quotes.length}&page=${ranPage}`, {
            headers: { Authorization: key },
        });
        const images = imgRes.data.photos;
        const quoteWithImg = quotes.map((quote, index) => ({
            ...quote,
            imageUrl: images[index] ? images[index].src.medium : null,
        }));
        res.render("index.ejs", { quotes: quoteWithImg });
    } catch (error) {
        res.status(500).json({ message: "Error fetching quotes" });
    }
});
app.get("/new", (req, res) => res.render("editPage.ejs"));
app.get("/edit/:id", async (req, res) => {
    try {
        const quoteData = await axios.get(`${API_URL}/quotes/${req.params.id}`);
        res.render("editPage.ejs", { quote: quoteData.data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post("/api/quotes", async (req, res) => {
    try {
        await axios.post(`${API_URL}/quotes`, req.body);
        res.redirect("/");
    } catch (error) {
        res.status(500).json({ message: "Error posting the new quote" });
    }
});
app.post("/api/quotes/:id", async (req, res) => {
    try {
        await axios.patch(`${API_URL}/quotes/${req.params.id}`, req.body);
        res.redirect("/");
    } catch (error) {
        res.status(500).json({ message: "Error updating the quote" });
    }
});
app.get("/api/quotes/delete/:id", async (req, res) => {
    try {
        await axios.delete(`${API_URL}/quotes/${req.params.id}`);
        res.redirect("/");
    } catch (error) {
        res.status(500).json({ message: "Error deleting the quote" });
    }
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
