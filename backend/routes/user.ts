import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {decode, sign, verify} from 'hono/jwt'

interface SignupRequestBody {
  email: string;
  password: string;
  name: string;
}

export const userRouter = new Hono<{  //to get rid of env variable type which are req in typescript also you can pass a comment @ts-ignore to removetype necessity of next line
    Bindings: {
        DATABASE_URL: string,
    JWT_SECRET: string
    },
  Variables: {
    id: string
  }
}>();


// Signup
userRouter.post('/signup', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
  try{
      const body: SignupRequestBody = await c.req.json();
      const user= await prisma.user.create({
        //@ts-ignore
        data: {
            email: body.email,
            password: body.password,
            name: body.name || '  ',
        },
      });
      const token = await sign({id: user.id},c.env.JWT_SECRET);
      return c.json({jwt: token});
    }catch(e){ 
      console.error(e);
      c.status(500);
      return c.json({error: "something went wrong while signing up"});
    }
})

// Signin
userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    const user = await prisma.user.findUnique({
        where: {
            email: body.email,
        }
    });

    if (!user) {
        c.status(403);
        return c.json({ error: "user not found" });
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });  
})
