import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import VideoCallIcon from '@material-ui/icons/VideoCall';
import Chatgrid from "./components/Chatgrid"
import React, { useEffect, useRef, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
import io from "socket.io-client"
import "./App.css"
const crypto = require("crypto");

const socket=io.connect("http://localhost:3002")

function App() {
  const [myId,setId]=useState("");
  const [online,setStatus]=useState(true);
  const [stream,setStream]=useState();
  const [recievingCall,setReceivingcall]=useState(false);
  const [caller,setCaller]=useState("");
  const [callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("");
  const [room,setRoom]=useState("");

  var myVideo=useRef();
  const peerVideo=useRef();
  const connectionRef=useRef(); //to connect and disconnect

  useEffect(()=>{
    setStatus(true);
    socket.on('me',(id)=>{
      
      const ide = crypto.randomBytes(16).toString("hex");
      setId(ide);

    })
    
    socket.on("callUser",(data)=>{
      setReceivingcall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    })
    // console.log(myId)
  },[])
  const join=(room)=>{
    if(room!=="" && name!==""){
      socket.emit('joinRoom',room);
    }
  }
  
  const callUser=id=>{
    
    const peer=new Peer({
      initiator:true,
      trickle:false,
      stream:stream
    })
    peer.on('signal',(data)=>{
          // console.log(id);
          socket.emit('callUser',{
            userToCall:id,
            signalData:data,
            from:myId,
            name:name
          })
    })
    peer.on('stream',(stream)=>{
      peerVideo.current.srcObject=stream;
    })
    socket.on("callAccepted",(signal)=>{
      setCallAccepted(true);
      peer.signal(signal)
    })
    
    connectionRef.current=peer;
  }

  const answerCall=()=>{
    
    setCallAccepted(true);
    console.log("hi")
    const peer=new Peer({
      initiator:false,
      trickle:false,
      stream:stream
    })
    peer.on('signal',data=>{
      socket.emit('answerCall',{signal:data,to:caller})
    })
    peer.on('stream',stream=>{
      peerVideo.current.srcObject=stream;
    })
    peer.signal(callerSignal);
    connectionRef.current=peer;
  }

  const leaveCall=()=>{
    setCallEnded(true);
    const peer=new Peer();
    peer.on('stream',stream=>{
      peer.removeStream(stream);
    })
    
    connectionRef.current.destroy();
   
  }
  const askPermission=()=>{
     online===true?setStatus(false):setStatus(true);
    console.log(online)
    if(online===true){
      navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
        setStream(stream)
          myVideo.current.srcObject = stream
      })
    }
    else if(online===false){
       setStream(null)
    }

  }
  const copy=()=>{
    navigator.clipboard.writeText(myId);
  }
  
 

  return (
    <div className="App">
      
        <div className="container">
         
              <div className="video-container">
                  <div className="video">
                        {stream && <video playsInline muted ref={myVideo} autoPlay style={{width:"300px"}}/>
                        
                        }
                  </div>
                  <div className="video">
                          {callAccepted && !callEnded?
                          <video playsInline ref={peerVideo} autoPlay style={{width:"300px"}}/>:null}

                  </div>
              </div>
              <div className="myId">
                    {/* {!online?:<div></div>} */}
                   
                      <div id="permission" >
                            <Button id="permit" onClick={askPermission} startIcon={<VideoCallIcon fontSize="large"/> }/>
                      </div>
                      <TextField
                        id="filled-basic"
                        label="Name"
                        variant="filled"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ marginBottom: "20px" }}
                      />
                     
                        <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />} onClick={copy}>
                          Copy ID
                        </Button>
                        
                    
                      
                      
                     
                      

                      <TextField
                        id="filled-basic"
                        label="ID to call"
                        variant="filled"
                        value={idToCall}
                        onChange={(e) => setIdToCall(e.target.value)}
                      />

                      <div style={{display:"flex"}}>
                     
                      <TextField
                        id="filled-basic"
                        label="Room"
                        variant="filled"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        style={{ marginBottom: "20px" ,marginTop:"10px"}}
                      />
                      <Button onClick={()=>join(room)} id="join" color="red">join</Button>
                     

                      </div>
                     
                      <div className="call-button">
                            {callAccepted && !callEnded ? (
                              <Button variant="contained" color="secondary" onClick={leaveCall}>
                                End Call
                              </Button>
                            ) : (
                              <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                                <PhoneIcon fontSize="large" />
                              </IconButton>
                            )}
                            {idToCall}
                      </div>
               </div>
               
                <div>
                  {recievingCall && !callAccepted ? (
                      <div className="caller">
                      <h1 >{name} is calling...</h1>
                      <Button variant="contained" color="primary" onClick={answerCall}>
                        Answer
                      </Button>
                    </div>
                  ) : null}
                </div>
         </div>
         <Chatgrid socket={socket} name={name} room={room}/>
          
    </div>
  );
}

export default App;
