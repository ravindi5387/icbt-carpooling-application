import {Link} from "react-router-dom";
export default function NotFound(){return <div className="not-found"><span className="eyebrow">404</span><h1>Page not found</h1><p>The page you are looking for does not exist.</p><Link to="/" className="button button-primary">Return home</Link></div>}
