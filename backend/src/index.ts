import { Hono } from 'hono'
import {userRouter} from '../routes/user'
import {blogRouter} from '../routes/blog'
import {cors} from 'hono/cors'


export const app = new Hono<{  //to get rid of env variable type which are req in typescript also you can pass a comment @ts-ignore to removetype necessity of next line
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string
	},
  Variables: {
    id: string
  }
}>();
app.use('/*', cors())

app.route('/api/v1/', userRouter)

// Middleware


app.route('/api/v1/blog', blogRouter)


export default app
