import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
const roles=new Set(["customer","host","co_host","property_manager","support","verification","finance","super_admin"]);
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"Method not allowed."},405);
 const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!anon||!secret)return json({error:"Role administration is not configured."},503);
 const token=req.headers.get("Authorization")?.match(/^Bearer\\s+(.+)$/i)?.[1];if(!token)return json({error:"Authentication required."},401);
 const auth=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}}),db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:ad,error:ae}=await auth.auth.getUser(token),actor=ad.user;if(ae||!actor?.id||!actor.email)return json({error:"Invalid or expired session."},401);
 const {data:sa}=await db.from("user_role_assignments").select("id").eq("user_id",actor.id).eq("role","super_admin").eq("is_active",true).maybeSingle();
 if(actor.app_metadata?.role!=="admin"&&!sa)return json({error:"Super Admin permission required."},403);
 let b:any;try{b=await req.json()}catch{return json({error:"Invalid JSON."},400)}
 if(b.action==="list"){
  const [{data:global,error:ge},{data:scoped,error:se}]=await Promise.all([
   db.from("user_role_assignments").select("id,user_id,role,is_active,assigned_at,expires_at").order("assigned_at",{ascending:false}).limit(300),
   db.from("property_staff_assignments").select("id,user_id,role,property_id,is_active,created_at").order("created_at",{ascending:false}).limit(300)
  ]);
  if(ge||se)return json({error:"Unable to load role assignments."},502);
  const ids=[...new Set([...(global||[]).map(x=>x.user_id),...(scoped||[]).map(x=>x.user_id)])];
  const users=await Promise.all(ids.map(async id=>{const {data}=await db.auth.admin.getUserById(id);return [id,data.user?.email||""] as const}));
  const emailMap=Object.fromEntries(users);
  return json({success:true,global:(global||[]).map(x=>({...x,email:emailMap[x.user_id]||""})),propertyScoped:(scoped||[]).map(x=>({...x,email:emailMap[x.user_id]||""}))});
 }
 const action=b.action,email=String(b.email||"").trim().toLowerCase(),role=String(b.role||""),propertyId=String(b.propertyId||"").trim();
 if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))return json({error:"Valid account email required."},400);
 if(!roles.has(role))return json({error:"Unsupported role."},400);
 if(role==="super_admin"&&actor.app_metadata?.role!=="admin")return json({error:"Only root admin can grant Super Admin."},403);
 if(["co_host","property_manager"].includes(role)&&!propertyId)return json({error:"Property ID required."},400);
 const {data:ud,error:ue}=await db.auth.admin.listUsers({page:1,perPage:1000});if(ue)return json({error:"Unable to find target account."},502);
 const target=ud.users.find(u=>u.email?.toLowerCase()===email);if(!target)return json({error:"No registered account found for this email."},404);
 if(action==="assign"){
  if(["co_host","property_manager"].includes(role)){
   const {data:p}=await db.from("properties").select("id").eq("id",propertyId).maybeSingle();if(!p)return json({error:"Property not found."},404);
   const {error}=await db.from("property_staff_assignments").upsert({property_id:propertyId,user_id:target.id,role,is_active:true,assigned_by:actor.id},{onConflict:"property_id,user_id"});if(error)return json({error:"Property role assignment failed."},502);
  }else{
   const {error}=await db.from("user_role_assignments").upsert({user_id:target.id,role,is_active:true,assigned_by:actor.id,expires_at:null},{onConflict:"user_id,role"});if(error)return json({error:"Role assignment failed."},502);
   if(role==="host"||role==="customer")await db.from("profiles").update({role:role==="host"?"host":"customer",updated_at:new Date().toISOString()}).eq("email",email);
  }
 }else if(action==="revoke"){
  let q=["co_host","property_manager"].includes(role)?db.from("property_staff_assignments").update({is_active:false}).eq("user_id",target.id).eq("role",role):db.from("user_role_assignments").update({is_active:false}).eq("user_id",target.id).eq("role",role);
  if(propertyId&&["co_host","property_manager"].includes(role))q=q.eq("property_id",propertyId);
  const {error}=await q;if(error)return json({error:"Role revocation failed."},502);
 }else return json({error:"Action must be assign, revoke, or list."},400);
 await db.from("admin_activity_logs").insert({actor_email:actor.email,action:"role_"+action,entity_type:"user_role",entity_id:target.id,details:{target_email:email,role,property_id:propertyId||null}});
 return json({success:true,action,email,role,propertyId:propertyId||null});
});