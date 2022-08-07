const express = require('express')
const app = express()
const PORT =process.env.PORT || 3000
const axios = require('axios')
require('dotenv').config()
var streamKey=""
const thread = require('child_process');
const API_KEY = process.env.API_KEY

app.use('/static',express.static(__dirname + "/static"))
app.use(express.json());
app.use(express.urlencoded());

app.get("/",(req,res)=>{
	res.sendFile(__dirname +'/index.html')
})


app.get("/contract",(req,res)=>{
	res.sendFile(__dirname +'/contract.html')
})


app.get("/getRate",async (req,res)=>{
	var ethVal;
	await axios.get("https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=ETH")
		.then(data=>{
			ethVal=data.data;
		})
	
	res.json(ethVal);
})

app.get("/show",(req,res)=>{
	res.status=200
	res.sendFile(__dirname + '/showData.html')
})

app.get("/create",(req,res)=>{
	res.status=200
	res.sendFile(__dirname + '/create.html')
})

app.post("/create",async (req,res)=>{
	var name =  req.body.data.name;
	var dur =  req.body.data.dur;
	var receipt = req.body.data.rec;
console.log(name);	
	if(!checkSpaces(name,false) || dur<10 || dur > 180){
		res.statusCode = 500;
		res.json({error: "Don't fool me , u wannabe hacker"});
	}

	var createStreamResponse =await requestStream(name,dur)
	if (createStreamResponse && createStreamResponse.data) {
		res.statusCode = 200;
		var finalData = createStreamResponse.data;
		res.json({streamKey:finalData.streamKey,pId:finalData.playbackId});
		console.log(createStreamResponse.data)
	} else {
		res.statusCode = 500;
		res.json({ error: "Something went wrong" });
	}
})

app.get("/watch",(req,res)=>{
	res.status=200
	res.sendFile(__dirname + '/view.html')
})


const server = app.listen(PORT,()=>{
	console.log(`listening on port ${PORT}`)
})

const io = require('socket.io')(server)
io.use(async function(socket, next) {
	var handshakeData = socket.request;
	streamKey=await  handshakeData._query['streamKey']
	console.log("middleware:",streamKey);
	next();
});
const requestStream= async (streamName,duration)=>{
	var streamProfiles =  [
		{
			"name": "720p",
			"bitrate": 2000000,
			"fps": 30,
			"width": 1280,
			"height": 720
		},
		{
			"name": "480p",
			"bitrate": 1000000,
			"fps": 30,
			"width": 854,
			"height": 480
		},
		{
			"name": "360p",
			"bitrate": 500000,
			"fps": 30,
			"width": 640,
			"height": 360
		}]
	try {
		const createStreamResponse = await axios.post(
			"https://livepeer.com/api/stream",
			{
				name: streamName,
				profiles: streamProfiles,
			},
			{
				headers: {
					"content-type": "application/json",
					authorization: "Bearer "+ API_KEY,
				},
			})

		return createStreamResponse 
	}
	catch (error) {
	 
	}

}



function checkSpaces(str, exact) {
    var len = str.replace(/\s/g, '').length
    return (exact ? len === str.length && len !== 0: len !== 0)
}



io.on('connection', function(socket) {
	console.log(socket.id + " connected")
	var url = "rtmp://rtmp.livepeer.com/live/"
	var key = streamKey
	stteamKey=""
	const ffmpeg = thread.spawn('ffmpeg', [
		"-f",
		"lavfi",
		"-i",
		"anullsrc",
		"-i",
		"-",
		"-c:v",
		"libx264",
		"-preset",
		"veryfast",
		"-tune",
		"zerolatency",
		"-c:a",
		"aac",
		"-f",
		"flv", 
		`${url}${key}`
	])

	ffmpeg.on('close', (code, signal) => {
		console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
	});

	ffmpeg.stdin.on('error', (e) => {
		console.log('FFmpeg STDIN Error', e);
	});

	ffmpeg.stderr.on('data', (data) => {
		console.log('FFmpeg STDERR:', data.toString());
	});
	socket.on("stream", ((data) => {
		ffmpeg.stdin.write(data)
		//		console.log(data);
	}))
	socket.on("disconnect",(socket => {
		console.log(socket.id + " disconnected")
	}))
});

