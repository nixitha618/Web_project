const express=require("express");
const multer=require("multer");
const cors=require('cors');
const {google}=require("googleapis");
const { GoogleAuth } = require('google-auth-library');

const fs=require('fs');
const path=require('path');

const app=express();
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(express.static("."));

app.use(
    cors({
        origin:"*",
        methods:["GET","POST","OPTIONS"],
        allowedHeaders:["content-Type","Authorization"],

    })
);
const upload=multer({dest:"uploads/"});


app.post("/upload",upload.single("video"),async(req,res) =>{
    if(!req.file){
        console.error("no file uploaded");
        return res.status(400).send("no file uploaded.");

    }
    try{
        console.log("file received",req.file);

        const auth=new google.auth.GoogleAuth({
            keyFile:"credentials.json",
            scopes:["https://www.googleapis.com/auth/drive.file"],
        });

        auth.getClient()
          .then(() => console.log("✅ Auth successful!"))
        .catch(err => console.error("❌ Auth failed:", err));


        const driveService=google.drive({version:"v3",auth});
        const fileMetadata={
            name:`${req.file.originalname}`,
            parents:["1I9uGavjtYVlRZZMjJ9MqCsK6Ga8_M1R5"],
        };
        const media={
            mimeType:req.file.mimetype,
            body:fs.createReadStream(path.join(__dirname,req.file.path)),
        };

       /* const file= await driveService.files.create({
            resource:fileMetadata,
            media:media,
            fields:"id",
        });*/
        const file = await driveService.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id,name,webViewLink"
          });
          console.log("Upload success:", file.data);
          
        console.log("file uploaded to Google Drive:",file.data.id);
       // fs.unlinkSync(path.join(__dirname,req.file.path));
        res.send(`file uploaded successfully:${file.data.id}`);

    }catch(error){
        if(error.response){

            console.error(
                "error response from Google Drive API:",error.response.data);
        }
        else{
            console.error("error uploading to google drive:",error);

        }
        res.status(500).send("error uploading to google drive");
            
    }
       
});

const PORT=process.env.PORT ||3000;
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);

});

