import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import metamaskSVG from "./assets/MetaMask_Fox.svg";
import { ethers } from "ethers";
import ABI from "./ABI.json";
import { gsap } from "gsap";
import { Draggable } from "gsap/all";
import { SocketBlockSubscriber } from "ethers";

gsap.registerPlugin(Draggable);

const addressToContract = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Ensure this is correct for your network

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const foxRef = useRef(null);
  const bottomRef = useRef(null);
  const btnSendRef = useRef(null);
  const vidRef = useRef(null);
  const allRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const playBg = () => {
    vidRef.current.muted = false
    setTimeout(() => {
      vidRef.current.muted = true
    }, 7000);
    
  }

  // Fetch messages function
  const getMessages = async () => {
    playBg()
    try {
      const msgs = await contract.getMsgs();
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    playBg()


    if (!input.trim()) return;

    


    try {
      const tx = await contract.sendMsg(input);
      await tx.wait();
      await getMessages();
      requestAnimationFrame(() => scrollToBottom());
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        alert("MetaMask is required!");
        return;
      }

      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();
        const _contract = new ethers.Contract(addressToContract, ABI, _signer);

        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);

        const msgs = await _contract.getMsgs();
        setMessages(msgs);

        _contract.on("msgSent", async () => {
          const updatedMsgs = await _contract.getMsgs();
          setMessages(updatedMsgs);
          scrollToBottom();
        });
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    init();


    // gsap.set(foxRef.current, {
    //   transformOrigin: "50% 50%",
    // });
    // GSAP Animation setup once refs exist
      const fox = foxRef.current;


      
      gsap.to(fox, {
        duration: 2,
        x: "-75vw",
        rotation: 720,
        ease: "power2.out",
        delay: 0.6,
        onComplete: () => {
          // Infinite rotation
          gsap.to(fox, {
            rotation: "+=360",
            duration: 2,
            repeat: 1,
            ease: "linear",
            transformOrigin: "50% 50%",
            onComplete: () => {
              gsap.to(fox, {
                duration: 2,
                x: "-40vw",
                rotation: 720,
                ease: "power2.out",
                onComplete: () => {
                  gsap.to(fox, {
                    rotation: "+=360",
                    duration: 2,
                    repeat: -1,
                    ease: "linear",
                  })
                }
              })
            }
          });
        },
      })

    

        Draggable.create(foxRef.current, {
          type: "x",
          bounds: ".container",
          // edgeResistance: 0.85,
          inertia: true,
        });



          setTimeout(() => {
            console.log("inside the scroll timeout");
            
            scrollToBottom()
          }, 600);

         
       
      }, [input]);

  return (
    <div style={{ position: "relative", height: "100vh" }} className="khadhroui font-mono" ref={allRef}>
      {/* Video Background */}
      <video
        ref={vidRef}
        autoPlay
        muted
        loop
        controls
        playsInline
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "translate(-50%, -50%)",
          zIndex: -1,
        }}
      >
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 1, color: "white" }} className="content">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="p-4 border-b border-gray-400 font-bold text-lg custom-bg flex items-center justify-between relative text-gray-200">

            <div className="">          
                Chat with web3 100% secure chat
            </div>
            <div className="container relative w-[75dvw]">
              <img
                ref={foxRef}
                id="fox"
                src={metamaskSVG}
                alt="MetaMask Fox"
                className="w-10 h-10 absolute left-[86%] cursor-pointer hover:w-12 hover:h-12 "
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 mt-8 ml-11 text-gray-300 overflow-hidden space-nowrap">
            {messages.length > 0 ? (
              messages.map((msg, i) => (
                <li key={i} className="list-none font-medium">
                  <strong>From:</strong> {msg.from}
                  <br />
                  <strong>Message:</strong> {msg.amsg}
                </li>
              ))
            ) : (
              <p>No messages yet.</p>
            )}
            <div ref={bottomRef}></div>
          </div>

          {/* Input Section */}
          <div className="border-t border-gray-700 p-2 flex">
            <input
              ref={btnSendRef}
              type="text"
              className="w-4/5 border rounded bg-transparent border-gray-700 focus:outline-none text-red px-3 py-2 hover:p-2 transition-padding duration-300"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className="w-1/5 bg-gray-900 text-gray-100 rounded ml-2 px-3 py-2 hover:scale-104 active:scale-95"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
