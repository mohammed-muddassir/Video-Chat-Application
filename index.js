const express=require('express');
const app=express();
const http=require('http');
const server=http.createServer(app);
// const {Server}=require('socket.io');
// // const io=new Server(server);
// const server = http.createServer(app)
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: [ "GET", "POST" ]
	}
})


app.use(express.static('public'));
// app.get('/',(req,res)=>{
    
// });
io.on('connection',socket=>{
    console.log("user connected");
    socket.emit('me',socket.id); //using useEffecct we connect at inital loading...
    socket.on('disconnect',()=>{
        socket.broadcast.emit("callended")
    })
    socket.on('callUser',(data)=>{
        io.to(data.userToCall).emit("callUser",{signal:data.signalData,from:data.from,name:data.name})

    })
    socket.on('joinRoom',data=>{
        socket.join(data);
    })
    socket.on('sendMessage',data=>{
        socket.to(data.room).emit('recieveMessage',data)
        console.log(data)
    })
    socket.on('answerCall',(data)=>{
        io.to(data.to).emit("callAccepted",data.signal)
    })
    
})
server.listen(3002,()=>{
    console.log("connected");
})