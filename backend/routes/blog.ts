import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {decode, sign, verify} from 'hono/jwt'

interface BlogBody {
  email: string;
  password: string;
  name: string;
}
export const blogRouter = new Hono<{Bindings: {
    DATABASE_URL: string,
JWT_SECRET: string
},
Variables: {
id: string
}}>();


// Blog
blogRouter.post('/api/v1/blog', async (c) => {
    const id = c.get('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: id
        }
    });
    return c.json({
        id: post.id
    });
})

// Update Blog
blogRouter.put('/api/v1/blog', async (c) => {
    const id = c.get('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    prisma.post.update({
        where: {
            id: body.id,
            authorId: id
        },
        data: {
            title: body.title,
            content: body.content
        }
    });

    return c.text('updated post');
});
// Show Blog
blogRouter.get('/api/v1/blog/:id', async (c) => {
    const id = c.req.param('id');
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());
    
    const post = await prisma.post.findUnique({
        where: {
            id
        }
    });

    return c.json(post);
})
// All blogs
blogRouter.get('/api/v1/blog/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());
    
    const posts = await prisma.post.findMany({});

    return c.json(posts);
})

