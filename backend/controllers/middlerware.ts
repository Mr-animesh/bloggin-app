import {Hono} from 'hono';


 export  const  middleware = async(c, next) =>{
  const jwt = c.req.header("authorization") || "";
  const token = jwt.split(" ")[1];
  const res =  await   verify(token, c.env.JWT_SECRET)
  if(res) {
    c.set('id', res.id);
    await next();
  }else{
    c.status(404)
    return c.json({err: "unauthorized"})
  }
}
