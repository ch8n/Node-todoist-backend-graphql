const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const graphqlHttp = require('express-graphql');
const schema = require('./graphql/schema/index');
const resolver = require('./graphql/resolver/index');

app.use(bodyParser.json())

app.get("/", (req, res, next) => {
    res.send("hellow world!")
})

app.use("/graphql", graphqlHttp({
    schema: schema,
    rootValue: resolver,
    graphiql: true
}))

app.listen(4000, () => {
    console.log(`running @ 4000`);
})
