// // Express app imports
const express = require("express");
const dotenv = require("dotenv");
const app = express();
const mongoose = require('mongoose');

// // for security of api
const xss = require("xss-clean");
// const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// // imports for files used in app
// const db = require("./Models");
const AppError = require("./utils/apperror");
const appRoutes = require("./Routes/appRoutes");
const userRoutes = require("./Routes/userRoutes");
const globalErrorHandler = require("./Controllers/errorController");

// setting .env file
dotenv.config({ path: "./config.env" });

// Node modules requirements for app
const PORT = process.env.PORT || 8000;
const path = require("path");
const fs = require("fs");

const db = process.env.DATABASE



// To prevent api from XSS
app.use(xss());

// // to allow cors in the server so that only trusted urls are allowed
// app.use(cors());
// app.options("*", cors());

// limiter for per hour api call is 100
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Please try after an hour",
});

app.use("/api", limiter);

// For payloads
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// give html response on / route
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "landingPage.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading landingPage.html file:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.send(data);
  });
});

// for cookie parsing
app.use(cookieParser());

// // for sending the response in compressed format
app.use(compression());

// routers
app.use("/api/assignments", appRoutes);
app.use("/api", userRoutes);
// app.use("/api/assignments", helpingRoutes);

// database connection and port listening
// db.sequelize.sync().then((req) => {
//   app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
//   });
// });

mongoose
  .connect(db, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB conneted sucessfully');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

// for every other url give a error json
app.all("*", (req, res, next) => {
  next(new AppError(`can't find the ${req.originalUrl} on the server`, 404));
});

// error handler
app.use(globalErrorHandler);
