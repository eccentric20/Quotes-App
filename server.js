import express from "express"
import bodyParser from "body-parser"
import axios from "axios"

const app = express();
const port = 3000;
const API_URL = "http://localhost:4000";
const key = "LQjp5EKc1ZW9eCbx9RjcZTm3WYBo7M6gvmuf83J4Dpbuk0WYWdlf8pcu";


app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", async(req, res) => {
    try{
        const response = await axios.get(`${API_URL}/quotes`);
        const quotes = response.data;
        const len = quotes.length; 
        console.log(response);
        const ranPage = Math.floor(Math.random() * 10) + 1;
        const image_api = `https://api.pexels.com/v1/search?query=nature&per_page=${len}&page=${ranPage}`;
        const imgRes = await axios.get(`${image_api}`, {
            headers: {
                Authorization: key
            }
        });

        

        const images = imgRes.data.photos;

        const quoteWithImg = quotes.map((quote, index) => {
            return {
                ...quote,
                imageUrl: images[index] ? images[index].src.medium : null
            }
        })

        res.render('index.ejs', {quotes: quoteWithImg});
    }
    catch(error){
        res.status(500).json({message: "Error fetching quotes"});
    }    
});

app.get('/new', (req, res) => {
    try{
        res.render('editPage.ejs');
    }catch(error){
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
})

app.get('/edit/:id', async(req, res) => {
    
    try{
        const quoteData = await axios.get(`${API_URL}/quotes/${req.params.id}`);
        console.log(quoteData.data);
        res.render('editPage.ejs', {
            quote: quoteData.data,
        });
    }catch(error){
        console.log(error.message);
        res.status(500).json({message: error.message});
    }

})

app.post('/api/quotes', async(req, res) => {
    try{
        const postQuote = await axios.post(`${API_URL}/quotes`, req.body);
        console.log(postQuote.data);
        res.redirect('/');
    } catch(error){
        console.log('Error posting the new quote');
        res.status(500).json({message: 'Error posting the new quote'});
    }
});

app.post('/api/quotes/:id', async(req,res) => {
    try{
        const updateQuote = await axios.patch(`${API_URL}/quotes/${req.params.id}`, req.body);
        console.log(updateQuote.data);
        res.redirect('/');
    } catch(error){
        console.log('Error updating the new quote');
        res.status(500).json({message: 'Error updating the new quote'});
    }
})

app.get('/api/quotes/delete/:id', async(req, res) => {
    try{
        const delQuote = await axios.delete(`${API_URL}/quotes/${req.params.id}`);
        console.log(delQuote.data.message);
        res.redirect('/');
    } catch(error){
        console.log('Error deleting quote');
        res.status(500).json({message: 'Error deleting quote'});
    }
})

app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
})

