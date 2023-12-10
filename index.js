// Import puppeteer
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const fs = require("fs-extra")
const path = require("path")
const data = require('./data.json');


// complile the hbs template to pdf document

const compile = async function (templateName, data) {
    const templatePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
    const cssPath = path.join(process.cwd(), 'templates', 'styles.css'); // Path to your CSS file
    const footerpath = path.join(process.cwd(), 'templates', 'footer.hbs');
    const headerpath = path.join(process.cwd(), 'templates', 'header.hbs')
    // get the html
    const html = await fs.readFile(templatePath, 'utf8');

    // read the CSS file
    const css = await fs.readFile(cssPath, 'utf8');
    //  read footer file
    let footer = await fs.readFile(footerpath, 'utf8')
    let header = await fs.readFile(headerpath, 'utf8')
    // compile the Handlebars template with CSS
    const template = hbs.compile(html);
    const content = template(data);

    // inject the CSS into the HTML
    const htmlWithCss = `<style>${css}</style>${content}`;

    return htmlWithCss;
};
// Define the Handlebars helper function

hbs.registerHelper('calculateRowspan', function (flag) {
    return flag ? '3' : '1';
});
const footerpage = path.join(process.cwd(), 'templates', 'footer.hbs');
const addressPartialSource = fs.readFileSync(footerpage, 'utf8');
hbs.registerPartial('addressPartial', addressPartialSource);
const headerPage = path.join(process.cwd(), 'templates', 'header.hbs');
const headerPartialSource = fs.readFileSync(headerPage, 'utf8');
hbs.registerPartial('headerPartial', headerPartialSource);


(async () => {
    try {
        // Launch the browser
        const browser = await puppeteer.launch({ slowMo: 250, headless: 'new' });

        // Create a page
        const page = await browser.newPage();

        const content = await compile('index', data);
        await page.setContent(content, { waitUntil: 'domcontentloaded' })
        //  create a PDf
        await page.pdf({
            path: 'output.pdf',
            format: "A4",
            printBackground: true

        })

        await browser.close();
        process.exit()
    } catch (e) {
        console.log(e)
    };

})();