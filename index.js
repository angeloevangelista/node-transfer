import fs from 'fs'
import path from "path";
import express from "express";
import { JSDOM } from 'jsdom'
import { networkInterfaces } from 'os';

const app = express();
const port = process.env.PORT || 3333;
const filesDirectory = path.resolve(__dirname, "files");

app.get('/', (request, response) => {
  response.setHeader('Content-Type', 'text/html')

  return response.send(prepareListPage().innerHTML);
});

app.get("/download", (request, response) => response.redirect('/'));

app.get("/download/:filename", (request, response, next) => {
  const { filename } = request.params;

  console.log(`📁 "${request.hostname}" is downloading "${filename}"`);

  next();
});

app.use("/download", express.static(filesDirectory));

app.listen(port, () => {
  const ipAddress = getCurrentLocalAddress();

  console.log(
    `🚀 Server is running at port ${port} and can be accessed on http://${ipAddress}:${port}`
  );
});

function prepareListPage() {
  const document = new JSDOM().window.document;

  const htmlElement = document.createElement('html');
  const bodyElement = document.createElement('body');
  const ulElement = document.createElement('ul');

  const directories = fs.readdirSync(filesDirectory);

  directories.filter(p => !p.startsWith('.')).forEach(directory => {
    const liElement = document.createElement('li');
    const aElement = document.createElement('a');

    aElement.href = `/download/${directory}`;
    aElement.innerHTML = directory;

    liElement.appendChild(aElement);
    ulElement.appendChild(liElement);
  });

  bodyElement.appendChild(ulElement);
  htmlElement.appendChild(bodyElement);

  return htmlElement;
}

function getCurrentLocalAddress() {
  const nets = networkInterfaces();
  const results = Object.create({});

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }

        results[name].push(net.address);
      }
    }
  }

  return Object.values(results)[0][0];
}
