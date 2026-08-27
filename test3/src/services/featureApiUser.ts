import {demoUser} from "../data/demo";
import {User} from "../types";
export function currentUserForFeatures():User{try{const x=localStorage.getItem("icbt_user");if(x)return JSON.parse(x) as User}catch{}return demoUser}
