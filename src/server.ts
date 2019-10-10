import express from 'express';
import bodyParser from 'body-parser';
const isUrl = require('is-url');
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Send filtered image
  app.get( '/filteredimage', async (req, res ) => {
    const imageUrl : string = req.query.image_url;
    if(!imageUrl) {
      return res.status(400).send({ message: "image_url is required."} )
    }

    if(!isUrl(imageUrl) ) {
      return res.status(400).send({ message: "invalid URL."} )
    }
    
    let filteredImagePath : string;
    try {
      filteredImagePath=  await filterImageFromURL(imageUrl);
    } catch(error)  {
      console.error(error);
      return res.status(422).send({ message: "failed to download or process image."} );
    };

    res.status(200).sendFile(filteredImagePath);
    res.on('finish', () => {
      deleteLocalFiles([filteredImagePath]);
    });
  
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();