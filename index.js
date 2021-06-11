import path from "path";
import express from "express";

const app = express();

app.use("/", express.static(path.resolve(__dirname, "files")));

app.listen(3333, () => console.log("OK"));