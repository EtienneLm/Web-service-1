import koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import fs from 'node:fs';
import path from 'node:path';

const app = new koa();
const router = new Router();

const filepath = path.join(process.cwd(), 'posts.seed.json');
const data = fs.readFileSync(filepath, 'utf-8');

const posts = JSON.parse(data); 

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = { 
            error: ctx.status >= 500
            ? 'internal error'
            : err.message
        };
    }
});

app.use(bodyParser({
    onlyError : (err, ctx) => {
        ctx.throw(err.status || 400, err.message || 'invalid json');
    }
}));


router.get('/posts', (ctx) => { // http://localhost:3000/posts?postId=1
    const postId = ctx.query.postId;

    if (postId !== undefined) {
        const number = Number(postId);

        if (!Number.isInteger(number) || number < 1) {
            ctx.status = 400;
            ctx.body = {error:'invalid postId, it needs to be over 1'};
            return;
        }

        ctx.body = posts.filter(post => post.postId === number);
        return;
    }
    ctx.body = posts;
}); 
router.get('/posts/:id', (ctx) => { // http://localhost:3000/posts/1
    const id = Number(ctx.params.id);
    const post = posts.find(post => post.id === id);

    if (!post) {
        ctx.status = 404;
        ctx.body = { error: 'Post not found, enter a valid id' };
        return;
    }

    ctx.body = post;
});

// post 
router.post('/posts', (ctx) => { // http://localhost:3000/posts
    const body = ctx.request.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        ctx.throw(400, 'Invalid body, it needs to be a json');
    }

    const postRequiredFields = ['postId', 'name', 'email', 'body'];
    for (const field of postRequiredFields) {
        if (!(field in body)) {
            ctx.throw(400, `Required field ${field} missing`);
        }
    }

    const postAllowedFields = ['postId', 'name', 'email', 'body'];
    for (const field of Object.keys(body)) {
        if (!postAllowedFields.includes(field)) {
            ctx.throw(400, `Unknown field : ${field}`);
        }
    }

    if (!Number.isInteger(body.postId) || body.postId < 1) {
        ctx.throw(400, 'Invalid postId, it needs to be an int > 1');
    }
    if(typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 100) {
        ctx.throw(400, 'Invalid name, it needs to be a string between 1-100 characters ');
    }

    const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm;
    if (typeof body.email !== 'string' || body.email.length > 100 || !emailRegex.test(body.email)) {
        ctx.throw(400, 'Invalid email, it needs to be a valid email');
    }
    if (typeof body.body !== 'string' || body.body.length < 1 || body.body.length > 500) {
        ctx.throw(400, 'Invalid body, it needs to be a string between 1-500 characters');
    }

    let newId; 
    if (posts.length > 0) {
        newId = Math.max(...posts.map(post => post.id)) + 1;
    } else {
        newId = 1;
    }

    const newPost = {
        postId: body.postId,
        id: newId,
        name: body.name,
        email: body.email,
        body: body.body
    };

    posts.push(newPost);
    ctx.status = 201;
    ctx.set('location', `/posts/${newId}`); // define header
    ctx.body = newPost;
});

router.delete('/posts/:id', (ctx) => { 
    const id = Number(ctx.params.id);
    const index = posts.findIndex(post => post.id === id);

    if (index === -1) {
        ctx.status = 404;
        ctx.body = { error: 'Post introuvable' };
        return;
    }

    posts.splice(index, 1);
    ctx.status = 204;
});

router.put('/posts/:id', (ctx) => {
    const id = Number(ctx.params.id);
    const index = posts.findIndex(post => post.id === id);

    if (index === -1) {
        ctx.status = 404;
        ctx.body = { error: 'Post introuvable' };
        return;
    }

    const body = ctx.request.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        ctx.throw(400, 'Invalid body, it needs to be a json');
    }

    const postRequiredFields = ['postId', 'name', 'email', 'body'];
    for (const field of postRequiredFields) {
        if (!(field in body)) {
            ctx.throw(400, `Required field ${field} missing`);
        }
    }

    const postAllowedFields = ['postId', 'name', 'email', 'body'];
    for (const field of Object.keys(body)) {
        if (!postAllowedFields.includes(field)) {
            ctx.throw(400, `Unknown field : ${field}`);
        }
    }

    if (!Number.isInteger(body.postId) || body.postId < 1) {
        ctx.throw(400, 'Invalid postId, it needs to be an int > 1');
    }
    if(typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 100) {
        ctx.throw(400, 'Invalid name, it needs to be a string between 1-100 characters ');
    }

    const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm;
    if (typeof body.email !== 'string' || body.email.length > 100 || !emailRegex.test(body.email)) {
        ctx.throw(400, 'Invalid email, it needs to be a valid email');
    }
    if (typeof body.body !== 'string' || body.body.length < 1 || body.body.length > 500) {
        ctx.throw(400, 'Invalid body, it needs to be a string between 1-500 characters');
    }

    const updatePost = {
        postId: body.postId,
        id: id,
        name: body.name,
        email: body.email,
        body: body.body
    };

    posts[index] = updatePost;

    ctx.status = 200;
    ctx.body = updatePost;
});

//app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.use((ctx) => {
    ctx.status = 404;
    ctx.body = { error: 'Unknown route', status: ctx.status };
});

app.listen(3000, () => {
     console.log('The server is up and running : http://localhost:3000');
});