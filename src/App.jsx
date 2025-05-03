import React, { useEffect, useState, useRef } from 'react';
import "./App.css"
import metamaskSVG from "./assets/MetaMask_Fox.svg"
import { ethers } from 'ethers';
import ABI from "./ABI.json"
import { gsap } from 'gsap';
import { Draggable } from 'gsap/all';
gsap.registerPlugin(Draggable);


const addressToContract = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

export default function App() {
  


  const [provider, setProvider] = useState("");
  const [signer, setSigner] = useState("");
  const [contract, setContract] = useState("");


  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  


  const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }


  const getMessages = async () => {
    const messages = await contract.getMsgs()
    console.log(messages[0]);

    setMessages(messages)
  }
  
  const sendMessage = async () => {
    const sent = await contract.sendMsg(input);
    await sent.wait();
    // setTimeout(() => {
      
    //   scrollToBottom()
    // }, 3000);

    await getMessages()
    requestAnimationFrame(() => {
      scrollToBottom();
    });

    setInput("")
    

  };
  
  
  const foxRef = useRef(null);
  const btnSendRef = useRef(null);

  
  useEffect(() => {

    const init = async () => {
      if(!window.ethereum) return 'metamsk is needed!';

      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(addressToContract, ABI, _signer);

      setProvider(_provider)
      setSigner(_signer)
      setContract(_contract)

      _contract.on("msgSent", async () => {
        const messages = await _contract.getMsgs()
        // console.log(messages);

        setMessages(messages)
      })

    
      const messages = await _contract.getMsgs()
  
      setMessages(messages)

    }


    init()
    
    setTimeout(() => {
      scrollToBottom()
    }, 80);


    const fox = foxRef.current;
    const btnSend = btnSendRef.current;

    gsap.to(fox, {
      duration: 3,
      x: "-80vw",
      rotation: 720,
      ease: "power2.out",
      delay:1,
      onComplete: () => {
        // Infinite rotation
        gsap.to(fox, {
          rotation: "+=360",
          duration: 2,
          repeat: -1,
          ease: "linear",
          transformOrigin: "50% 50%",
        });
      },
    });


    Draggable.create(fox, {
      type: "x",
      bounds: ".container",
      edgeResistance: 0.85,
      inertia: true,
    });

    



  }, [])


  


  return (
    <div className="flex h-screen bg-gray-800">
      


      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b font-bold text-lg bg-gray border-gray-700 custom-bg" >
          Chat with web3 100% secure chat
          <div className="container">
            <img ref={foxRef} id="fox" src={metamaskSVG} alt="MetaMask Fox" className="w-10 h-10 absolute left-[86%] cursor-pointer hover:w-12 hover:h-12" />
          </div>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 mt-[3rem] ml-3 space-y-9">
         {messages.length > 0 ? (
           messages.map((msg, i) => (
             <li key={i} className="font-bold text-lg list-none" >
                <strong>From:</strong> {msg.from}<br />
                <strong ref={bottomRef}>Message:</strong> {msg.amsg}
             </li>
           ))
          )  : (
          <p>No messages yet.</p>
        )}
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-800 border-t flex border-gray-700 custom-scrollbar">

          {/* <div className="input-container relative w-[200vw] h-[200vh] overflow-hidden bg-gray-100 "> */}
          <input
            ref={btnSendRef}
            type="text"
            className="w-4/5 border rounded px-4 py-2 mr-2 bg-gray-800 border-gray-700 focus:outline-none text-gray-200"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
          />

          {/* </div> */}

          <button
            onClick={sendMessage}
            className="w-1/5 bg-gray-900 text-gray-100 px-4 py-2 rounded transition-all duration-1 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95 active:shadow-inner"
            >
            Send
          </button>


          
        </div>
      </div>
    </div>
  );
}

