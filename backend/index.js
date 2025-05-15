const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

let transporter; 

mongoose.connect("mongodb://127.0.0.1:27017/passkey")
    .then(() => {
        console.log("Connected to DB");

        const credential = mongoose.model("credential", {}, "bulkmail");

        return credential.find();
    })
    .then((data) => {
        if (data.length === 0) throw new Error("No credentials found");

        const emailCredential = data[0].toJSON();
        console.log("emailCredential",emailCredential)
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailCredential.user,
                pass: emailCredential.pass,
            },
        });

        console.log("Transporter configured successfully.");
    })
    .catch((error) => {
        console.error("Setup failed:", error);
    });

app.post("/sendEmail", async (req, res) => {
    const { msg: message, emailList } = req.body;

    if (!transporter) {
        return res.status(503).send("Email transporter not ready.");
    }

    try {
        for (let i = 0; i < emailList.length; i++) {
            await transporter.sendMail({
                from: transporter.options.auth.user, 
                to: emailList[i],
                subject: "A message from Bulk Mail App",
                text: message
            });
        }
        res.send(true);
    } catch (error) {
        console.error("Send email error:", error);
        res.send(false);
    }
});

app.listen(5000, () => {
    console.log("Server started on port 5000");
});
