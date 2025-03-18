import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'//server to backend call
import { withAccelerate } from '@prisma/extension-accelerate'
import {verify} from 'hono/jwt'

interface BlogBody {
    title: string;
    content: string;
    authorId: string;
    author: string;
}
export const blogRouter = new Hono<{Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
    },
    Variables: {
        id: string  
    }}>();


blogRouter.use('/*', async (c, next) => {
	const header = c.req.header("authorization") || "";
	const token = header.split(" ")[1]

	try {
		const response = await verify(token, c.env.JWT_SECRET);
		
		if (response.id) {
			c.set("id", String(response.id));
			await next()
		} else {
			c.status(411);
			return c.json({ error: "unauthorized" })
		}
	} catch (e) {
		c.status(406);
		return c.json({ error: "unauthorized" })
	}

})


// Blog
blogRouter.post('/', async (c) => {
    const id = c.get('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const body: BlogBody = await c.req.json();
    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: id,
        }
    });
    return c.json({
        id: post.id
    });
})

// Update Blog
blogRouter.put('/', async (c) => {
    const id = c.get('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const post = await prisma.post.update({
        where: {
            id: body.id,
            authorId: id
        },
        data: {
            title: body.title,
            content: body.content
        }
    });
    return c.json({
        title: post.title,
		content: post.content
    });
});

// All blogs
blogRouter.get('/bulk', async (c) => {
    
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());
    
    const posts = await prisma.post.findMany({
        select: {   
            content: true,
            title: true,
            id: true,
            author:{
                select:{
                    name: true
                }
            }
        }
    });
    return c.json(posts);
})

// Show Blog
blogRouter.get('/:id', async (c) => {
    const blogid = c.req.param('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());
    
    const post = await prisma.post.findUnique({
        where: {
            id:blogid
        },
        select: {
            id: true,
            title: true,
            content: true,
            author: {
                select: {
                    name: true,
                    id: true
                }
            }
        }
    });
    return c.json(post);
})





