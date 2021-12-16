import React,{useEffect,useState} from 'react';
// import '/home/muddassir/Documents/reactProjects/vChat/vchatapp/src/App.css'
import Send from '@material-ui/icons/Send'
import { Button } from '@material-ui/core';

function Chatgrid({socket,name,room}) {
    const [message,setMessage]=useState("");
    const [msgList,setList]=useState([]);
    const author=name;
    const sendMessage=async()=>{
        
        if(message!==""){
            const messageData={
                room:room,
                author:name,
                message:message,
                time:new Date(Date.now()).getHours()+":"+new Date(Date.now()).getMinutes()


            };
            await socket.emit('sendMessage',messageData)
            setList((msgList)=>[...msgList,messageData])
            
        }
        document.getElementById("inp").value="";
        
        

    }
    useEffect(()=>{
        socket.on('recieveMessage',data=>{
            setList((msgList)=>[...msgList,data])
        })
    },[socket])
    return (
        <div id="chat-container">
           {/* <div id="chat-box"> */}
                {/* <div> */}
                {msgList.map((msg)=>{

                   if(msg.author===author){
                    return <div id="user-box">
                                 <h3 id="user-msg">{msg.message}</h3>
                            </div>
                   }
                   else{
                    return <div id="peer-box">
                                 <h3 id="peer-msg">{msg.message}</h3>
                            </div>

                   }
                   {/* return  <div id={msg.author===author?"user-msg":"peer-msg"}>
                                 <h3 >{msg.message}</h3>
                            </div> */}
                })}
                {/* </div> */}
            
            {/* </div> */}
            <div id="chat-footer">
                <input id="inp" placeholder="Message" onChange={(event)=>{setMessage(event.target.value)}}></input>
                {message!==""&&<Button onClick={sendMessage} startIcon={<Send  fontSize="medium" id="send" ></Send>}></Button>}
            </div>
        </div>
    );
}

export default Chatgrid;
