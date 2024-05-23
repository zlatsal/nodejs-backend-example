const http = require("http");
const url = require("url");
const fs = require("fs").promises;
const products = require('./data/data.json');

const server = http.createServer(async (req, res) => {
  console.log(req.headers);

  //const myUrl = new URL(req.url, `http://${req.headers.host}/`);
  const myUrl = new URL(req.url, `http://localhost:4000`);
  const pathname = myUrl.pathname;
  const id = myUrl.searchParams.get("id");
  console.log(pathname, id);

  if (pathname === "/") {
    const html = await fs.readFile("./view/index.html", "utf-8");

    const ALLMAINPRODUCTS = await fs.readFile("./view/main/index.html", "utf-8");

    let allTheProducts = '';

    for (let index = 0; index <6; index++) {
      allTheProducts += replaceTemplate(ALLMAINPRODUCTS, products
        [index]);
    }
    html = html.replace(/<ALLMAINPRODUCTS>/g, allTheProducts);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } else if (pathname === "/product" && id >= 0 && id <= 5) {
    let html = await fs.readFile("./view/product.html", "utf-8");
    const product = products.find((p) => p.id === id);
    
    html = replaceTemplate(html, product);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } else if (/\.(png)$/i.test(req.url)) {
    const image = await fs.readFile(`./public/images/${req.url.slice(1)}`);
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(image);
  } else if (/\.(css)$/i.test(req.url)) {
    const css = await fs.readFile(`./public/css/index.css`);
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(css);
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>File Not Found</h1>");
  }
});

server.listen(4000);

function replaceTemplate(html, product) {

  html = html.replace(/<%IMAGE%>/g, product.image);
  html = html.replace(/<%NAME%>/g, product.name);

  let price = product.originalPrice;
  if(product.hasDiscount){
    price = (price *(100 - product.hasDiscount));
  }

  html = html.replace(/<%NEWPRICE%>/g, `$${price}.00`);
  html = html.replace(/<%OLDPRICE%>/g, `$${product.originalPrice}`);
  html = html.replace(/<%ID%>/g, product.id);

  if(product.hasDiscount){
    html = html.replace(/<%DISCOUNTRATE%>/g, `<span>${product.discount}% Off</span>`);
  } else {
    html = html.replace(/<%DISCOUNTRATE%>/g, ``);
  }

  return html;
}
