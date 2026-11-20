const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

const examples = [
  { id: 1, nom: 'Ada', langue: 'français' },
  { id: 2, nom: 'Alan', langue: 'anglais' },
  { id: 3, nom: 'Grace', langue: 'anglais' }
];

app.use(async (ctx, next) => {
  const debut = Date.now()
  await next()
  console.log(`${ctx.method} ${ctx.path} -> ${ctx.status} (${Date.now() - debut} ms)`)
})

// app.use(async (ctx) => {
//   if(ctx.path === '/texte') {
//     ctx.body = 'Hello, en texte';
//   } else if(ctx.path === '/json') {
//     ctx.body = 'Hello, en json';
//   } else if(ctx.path === '/vide') {
//     ctx.status = 204;
//     ctx.body = null;
//   } else if (ctx.path === '/cree') {
//     ctx.status = 201;
//     ctx.set('Location', '/example/1');
//     ctx.body = {id : 1};
//   }
// });
router.get('/examples', (ctx) => {
  ctx.body = examples;
});

router.get('/examples/:id', (ctx) => {
  const id = Number(ctx.params.id);
  const example = examples.find((ex) => ex.id === id);

  if (example) {
    ctx.body = example;
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Example not found' };
  }
}); 

router.get('/health', (ctx) => {
  ctx.body = { message :'Server is up and healthy !'};
});

router.post('/zigi', (ctx) => {
  ctx.body = { message :'Zigi is up and healthy !', status : 200};
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
    console.log('The server is up and running on port 3000');
});