import {describe,expect,it} from "vitest";
function validEmail(x:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)}
function validPassword(x:string){return x.length>=6}
function validSeats(x:number){return Number.isInteger(x)&&x>=1&&x<=8}
describe("frontend validation",()=>{
 it("accepts valid email",()=>expect(validEmail("student@icbt.lk")).toBe(true));
 it("rejects invalid email",()=>expect(validEmail("student@")).toBe(false));
 it("requires six-character password",()=>{expect(validPassword("12345")).toBe(false);expect(validPassword("123456")).toBe(true)});
 it("allows one to eight seats",()=>{expect(validSeats(1)).toBe(true);expect(validSeats(8)).toBe(true);expect(validSeats(0)).toBe(false);expect(validSeats(9)).toBe(false)});
});
