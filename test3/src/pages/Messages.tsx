import {FormEvent,useEffect,useState} from "react";
import {MessageCircle,Send} from "lucide-react";
import {useSearchParams} from "react-router-dom";
import {demoRides} from "../data/demo";
import {getMessages,sendMessage} from "../services/api";
import {Message} from "../types";
import {useAuth} from "../context/AuthContext";
export default function Messages(){
 const [params]=useSearchParams();const [selected,setSelected]=useState(params.get("ride")||"r1");const [messages,setMessages]=useState<Message[]>([]);const [text,setText]=useState("");const {user}=useAuth();
 useEffect(()=>{getMessages(selected).then(setMessages)},[selected]);
 async function submit(e:FormEvent){e.preventDefault();if(!text.trim())return;const m=await sendMessage(selected,text.trim());setMessages(x=>[...x,m]);setText("")}
 return <div className="page"><div className="page-heading"><div><span className="eyebrow">COMMUNICATION</span><h1>Messages</h1><p>Coordinate pickup and ride details with participants.</p></div></div><div className="messages-layout"><aside className="conversation-list"><div className="conversation-title"><strong>Conversations</strong><span>{demoRides.length}</span></div>{demoRides.map(r=><button key={r.id} className={`conversation ${selected===r.id?"selected":""}`} onClick={()=>setSelected(r.id)}><div className="avatar">{r.driver.name[0]}</div><div><strong>{r.driver.name}</strong><small>{r.origin} → {r.destination}</small></div></button>)}</aside><section className="chat-panel"><div className="chat-header"><div className="avatar">{demoRides.find(r=>r.id===selected)?.driver.name[0]}</div><div><strong>{demoRides.find(r=>r.id===selected)?.driver.name}</strong><small>Ride coordination</small></div></div><div className="chat-body">{messages.length?messages.map(m=><div key={m.id} className={`bubble-row ${m.senderId===user?.id?"mine":""}`}><div className="bubble"><p>{m.text}</p><small>{new Date(m.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</small></div></div>):<div className="chat-empty"><MessageCircle size={27}/><p>No messages yet. Start the conversation.</p></div>}</div><form className="chat-input" onSubmit={submit}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message…" aria-label="Message"/><button className="button button-primary" aria-label="Send"><Send size={16}/></button></form></section></div></div>
}
