const express = require('express');
const turf = require('@turf/turf');
const app = express();
const port = 3000;
// import lines from "../backend/lines.js";
// Middleware to parse JSON in the request body
app.use(express.json());

// Dummy authentication function
function authenticate(req, res, next) {
  // Check the Authorization header for valid authentication token
//   console.log(req);
  const authToken = req.header('Authorization');
  
  // Perform authentication check here
  // Replace this with your actual authentication logic
  
  if (!authToken) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    // Authenticated
    next();
  }
}
// Endpoint for finding line intersections
app.post('/api/intersections',authenticate, (req, res) => {
    // console.log(req.body);
  try {
    const  linestring  = req.body;
    const  lines  = require('./lines');
    const linestring=require('./long-ls.json');
    // Validate the linestring
    if (!linestring || !Array.isArray(linestring.coordinates)) {
      throw new Error('Invalid linestring');
    }

    // Convert GeoJSON linestring to turf LineString
    const turfLinestring = turf.lineString(linestring.coordinates);

    const intersections = [];

    // Find intersections with each line
    var count=0;
    for (const line of lines) {
      const turfLine = turf.lineString(line.line.coordinates);
      // Check for intersection
      if (turf.booleanIntersects(turfLinestring, turfLine)) {
        console.log("Intersecting",count);
        const intersectionPoint = turf.lineIntersect(turfLinestring, turfLine);
        intersections.push({
          lineId: "L"+count,
          intersectionPoint,
        });
      }
      count++;
    }

    // Return the intersections
    if (intersections.length === 0) {
      res.json([]);
    } else {
      res.json(intersections);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
