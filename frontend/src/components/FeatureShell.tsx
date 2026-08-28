import {Link} from "react-router-dom";
export function SectionTitle({eyebrow,title,description,action}:{eyebrow:string;title:string;description?:string;action?:React.ReactNode}){
 return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action}</div>
}
export function Metric({label,value,sub,icon}:{label:string;value:string|number;sub?:string;icon?:React.ReactNode}){
 return <div className="metric-card">{icon&&<div className="metric-icon">{icon}</div>}<span>{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</div>
}
export function Back({to="/dashboard"}:{to?:string}){return <Link className="back-link" to={to}>← Back</Link>}
