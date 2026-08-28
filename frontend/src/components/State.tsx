import {AlertTriangle,LoaderCircle,SearchX} from "lucide-react";
export function Loading({label="Loading…"}:{label?:string}){return <div className="state"><LoaderCircle className="spin" size={27}/><strong>{label}</strong><p>Please wait a moment.</p></div>}
export function ErrorState({message}:{message:string}){return <div className="state error-state"><AlertTriangle size={27}/><strong>Something went wrong</strong><p>{message}</p></div>}
export function Empty({title,description}:{title:string;description:string}){return <div className="state"><SearchX size={27}/><strong>{title}</strong><p>{description}</p></div>}
