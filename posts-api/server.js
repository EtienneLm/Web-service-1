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

router.get('/posts', (ctx) => {
    ctx.body = posts;
    ctx.status = 200;
}); 

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
     console.log('The server is up and running : http://localhost:3000');
});