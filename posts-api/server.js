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
// console.log(posts.length);

router.get('/posts', (ctx) => { // http://localhost:3000/posts?postId=2
    const postId = ctx.query.postId;

    if (postId !== undefined) {
        const number = Number(postId);

        if (!Number.isInteger(number) || number < 1) {
            ctx.status = 400;
            ctx.body = {error:'invalid postId, it needs to be over 1'};
            return;
        }

        ctx.body = posts.filter(posts => posts.id === number);
        return;
    }
    ctx.body = posts;
}); 
router.get('/posts/:id', (ctx) => {
    const id = Number(ctx.params.id);
    const post = posts.find(post => post.id === id);

    if (!post) {
        ctx.status = 404;
        ctx.body = { error: 'Post not found, enter a valid id' };
        return;
    }

    ctx.body = post;
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
     console.log('The server is up and running : http://localhost:3000');
});