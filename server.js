const express = require("express"); // Used to set up a server
const cors = require("cors"); // Used to prevent errors when working locally
const { Router } = require("express");
const app = express(); // Initialize express as an app variable

app.use((req, res, next)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});
app.set("port", process.env.PORT || 6968); // Set the port
app.use(express.json()); // Enable the server to handle JSON requests
app.use(cors()); // Dont let local development give errors

app.get("/", (req, res) => {
    res.json({ msg: "Something" });
});


app.use('/users', require('./routes/users'))
app.use('/products', require('./routes/products'))

app.listen(app.get("port"), () => {
    console.log(`Listening for calls on port ${app.get("port")}`);
    console.log("Press Ctrl+C to exit server");
}); 
app.use(cors({
    origin: ['http://127.0.0.1:8080', 'http://localhost:8080'],
    credentials: true
 }));
// credentials will allow you to access the cookie on your fetch(url, 

module.exports = {
    devServer: {
        Proxy: '*'
    }
}