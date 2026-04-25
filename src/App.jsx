import React, { useEffect, useState, useRef, useCallback } from "react";
import "./App.css";
import metamaskSVG from "./assets/MetaMask_Fox.svg";
import { ethers } from "ethers";
import ABI from "./ABI.json";
import { gsap } from "gsap";
import { Draggable } from "gsap/all";

gsap.registerPlugin(Draggable);

const addressToContract = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const foxRef = useRef(null);
  const bottomRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required!");
      return;
    }
    
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      // Check if already connected first
      const accounts = await _provider.send("eth_accounts", []);
      let activeAccount = accounts[0];

      if (!activeAccount) {
        const requestedAccounts = await _provider.send("eth_requestAccounts", []);
        activeAccount = requestedAccounts[0];
      }

      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(addressToContract, ABI, _signer);

      setProvider(_provider);
      setContract(_contract);
      setAccount(activeAccount);

      const msgs = await _contract.getMsgs();
      setMessages(msgs);

      // Listener for real-time updates
      _contract.on("msgSent", async () => {
        const updatedMsgs = await _contract.getMsgs();
        setMessages(updatedMsgs);
      });
    } catch (error) {
      console.error("Connection error:", error);
      if (error.code === -32002) {
        alert("A connection request is already pending in MetaMask. Please open your extension.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !contract || isLoading) return;
    setIsLoading(true);

    try {
      const tx = await contract.sendMsg(input);
      await tx.wait();
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const fox = foxRef.current;
    
    // Performance: Use simple, non-repeating animations by default
    // Only animate on initial load or interaction
    gsap.fromTo(fox, 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    Draggable.create(fox, {
      type: "x,y",
      bounds: window,
      inertia: true,
      onDragStart: () => gsap.to(fox, { scale: 1.1, duration: 0.2 }),
      onDragEnd: () => gsap.to(fox, { scale: 1, duration: 0.2 })
    });
  }, []);

  return (
    <div className="relative h-screen overflow-hidden font-sans text-gray-100 bg-gray-950">
      {/* Optimized Background: Lower opacity and will-change for GPU acceleration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="object-cover w-full h-full opacity-20 will-change-transform"
          style={{ filter: 'blur(5px)' }}
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-transparent to-gray-950/95"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto shadow-2xl border-x border-white/5 backdrop-blur-md bg-black/20">
        <header className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${account ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <h1 className="text-xl font-bold tracking-tight text-white/90">Web3 Messenger</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {account ? (
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Connected</span>
                <span className="text-sm font-mono text-blue-400">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-4 py-2 text-sm font-bold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-500 active:scale-95 disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
            <img
              ref={foxRef}
              src={metamaskSVG}
              alt="MetaMask"
              className="w-10 h-10 cursor-grab active:cursor-grabbing select-none"
            />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
          {messages.length > 0 ? (
            messages.map((msg, i) => {
              const isMe = account && msg.from.toLowerCase() === account.toLowerCase();
              return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"} transition-all duration-300`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20" 
                      : "bg-gray-800/80 text-gray-200 rounded-tl-none border border-white/10"
                  }`}>
                    {!isMe && (
                      <div className="mb-1 text-[10px] font-bold text-blue-400 uppercase tracking-tight">
                        {msg.from.slice(0, 10)}...
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.amsg}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-center font-medium">No decentralized messages yet.</p>
            </div>
          )}
          <div ref={bottomRef} />
        </main>

        <footer className="p-4 bg-white/5 border-t border-white/10">
          <div className="flex space-x-3">
            <input
              type="text"
              disabled={!account || isLoading}
              className="flex-1 px-4 py-3 text-white bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-30"
              placeholder={account ? "Write a message..." : "Please connect wallet"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!account || !input.trim() || isLoading}
              className="px-6 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
