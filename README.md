# NumberGameServer

This is a server for [Number Game APP](https://github.com/JasperHsieh/NumberGame) written by javascript.<br>
It use nodeJS express and mongoDB to handle the request from Number Game App. <br>

### Handle requests
This server handle 5 request inlcuding main page "/".
```
1. app.get('/', function(req, res)
2. app.post('/registerUserId', function(req, res) 
3. app.post('/checkPairState', function(req, res)
4. app.post('/checkTable', function(req, res)
5. app.post('/submitNumbers', function(req, res)
```
Your can see except first one is for GET request, others are for POST request.<br>
Run the server by "node server.js" and checking the server is running on [localhost:3000](http://localhost:3000/). <br>
```
You enter Number Game server
```
If you see the above message, it means you are successfully access the server and <br>
got the message handled GET request '/' by server. <br>

##### Pairing state request
```
2. app.post('/registerUserId', function(req, res)
```
One got '/registerUserId' request, server will insert the User ID the database and create a table for<br>
this player and his opponent.
```
3. app.post('/checkPairState', function(req, res)
```
After player register his ID, [Number Game APP](https://github.com/JasperHsieh/NumberGame) will keep sending 'checkPairState' request to check<br> 
his opponent's registerd state. Once his opponent has registered, the game will start immediately.<br>

##### Gaming state
```
4. app.post('/checkTable', function(req, res)
```
This handler will send the guess result of player's opponent to player. So basically after player submit the number he<br>
guess. The app side will keep sending 'checkTable' request to get to result from opponent.
```
5. app.post('/submitNumbers', function(req, res)
```
This part obviously is for handling player's guess number. It will insert the result to the table created when game <br>
was initialized.


