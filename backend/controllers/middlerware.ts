import {Hono} from 'hono';
import {decode, sign, verify} from 'hono/jwt'


 export  const  middleware = async(c, next) =>{
  const jwt = c.req.header("authorization") || "";
  const token = jwt.split(" ")[1];
  const res =  await verify(token, c.env.JWT_SECRET)
  if(res) {
    c.set('id', res.id);
    await next();
  }else{
    c.status(403)
    return c.json({err: "unauthorized"})
  }
}
