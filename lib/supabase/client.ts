type Query={select:(s?:string)=>Query;eq:(c:string,v:string)=>Query;single:()=>Promise<{data:any,error:null}>};
type User={id:string;email?:string};
export function createBrowserClient(){return {auth:{getUser:async():Promise<{data:{user:User|null},error:null}>=>({data:{user:null},error:null}),getSession:async():Promise<{data:{session:{access_token:string}|null},error:null}>=>({data:{session:null},error:null}),signOut:async()=>({error:null})},from:(_t:string):Query=>({select(){return this},eq(){return this},single:async()=>({data:null,error:null})}),channel:(name:string)=>({on(){return this},subscribe(){return {name}}}),removeChannel:async()=>{}}}
export const supabase = createBrowserClient();
