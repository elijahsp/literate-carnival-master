# Server for Turnstile Network Sales Counting

This program is for the server on the automated turnstile system. It collects the sales info from the turnstile through the network and saves it to a database. This program also provides the data for the web app for viewing of users. The program communicates to the turnstile using mqtt protocol and serves the web app using express api. The database used is postgresql.


The program must be used in combination with the turnstile sales web app. Node.js must be on installed on your computer to run this program. Use command "npm install" on the folder to install dependencies. Use command "node index" to see if the program is working properly. The program may encounter an error if some dependencies are not installed. In that case, check the logs for missing libraries and manually install it with "npm install <library name>". PM2 can be used to keep the program running always even after device reboots. The express api is listening on port 5500 and may need configuration from the computer's firewall

  Edit the db.js file for the corresponding database details. The mqtt server is set on the client variable on the file index.js.
  
