import { Hono } from 'hono'
import {userRouter} from '../routes/user'
import {blogRouter} from '../routes/blog'
import {middleware} from '../controllers/middlerware'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {decode, sign, verify} from 'hono/jwt'

interface SignupRequestBody {
  email: string;
  password: string;
  name: string;
}

export const app = new Hono<{  //to get rid of env variable type which are req in typescript also you can pass a comment @ts-ignore to removetype necessity of next line
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string
	},
  Variables: {
    id: string
  }
}>();


app.route('/api/v1/', userRouter)

// Middleware
app.use('/api/v1/blog/*', middleware)


app.route('/api/v1/blog', blogRouter)


export default app
