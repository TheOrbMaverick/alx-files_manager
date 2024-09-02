import express from 'express';
const express = require('express');
const routes = require('./routes/index');

const app = express();

app.use(express.json());
app.use('/', routes);

const port = process.env.PORT || 5000;

app.listen(port, (err) => {
  if (err) { console.log(err); }
  console.log(`Server is running on port ${port}`);
});

export default app;
