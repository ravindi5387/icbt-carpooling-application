import {X} from "lucide-react";
export default function Modal({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:React.ReactNode}){
 if(!open)return null;
 return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">CONFIRMATION</span><h3>{title}</h3></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div>{children}</div></div>
}
