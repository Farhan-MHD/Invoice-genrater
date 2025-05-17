import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import bodyParser from "body-parser"

const app = express();
const port = process.env.PORT || 5000;

// Resolve the file path (for compatibility)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let template =  ``
let owName,owAddress,owEmail,cuName,cuNumber,cuAddress,invoiceNumber,invoiceDate,dueDate,description0,qty0,price0
function makeTemplate(object){

        let extracedArray = extractItem(object);
        let [templateOfPrice,subTotal] = makePriceTemplate(extracedArray);

        let tax = subTotal * 0.02 ;
        let grandTotal = subTotal + tax ;



    owName = object["ow-name"];
    owAddress = object["ow-address"];
    owEmail = object["ow-email"];
    cuName = object["cu-name"];
    cuNumber = object["cu-number"];
    cuAddress = object["cu-address"];
    invoiceNumber = object["invoice-number"];
    invoiceDate = object["invoice-date"];
    // dueDate = object["due-date"]
    console.log(invoiceDate)
    console.log(object)



    template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
        .invoice-container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
        .header { text-align: center; }
        h1 { color: #333; }.details{display: flex; justify-content: space-around;}.details p{margin: 8px;}
        .company-details, .client-details { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 10px; text-align: left; }
        th { background-color: #f4f4f4; }
        .total-section {  font-weight: bold; }
        .chart-container { text-align: center; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <h1>Invoice</h1>
            <p><strong>Invoice No:</strong> ${invoiceNumber} | <strong>Date:</strong> ${invoiceDate}</p>
        </div>
        <div class="details">
            <div class="company-details">
                <p><strong>From:</strong></p>
                <p>${owName}</p>
                <p>${owAddress}</p>
                <p>${owEmail}</p>
            </div>
    
            <div class="client-details">
                <p><strong>To:</strong></p>
                <p>${cuName}</p>
                <p>${cuAddress}</p>
                <p>${cuNumber}</p>
            </div>
        </div>
        

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Price (QAR)</th>
                    <th>Total (QAR)</th>
                </tr>
            </thead>
            <tbody>
            ${templateOfPrice}
            </tbody>
        </table>

        <p class="total-section">Subtotal: ${subTotal} LKR</p>
        <p class="total-section">Tax (2%): ${tax} LKR</p>
        <p class="total-section"><strong>Grand Total: ${grandTotal} LKR</strong></p>
    </div>

   
</body>
</html>

` 

}
// Extract item from object
function extractItem(object){
    let itemsextr = [];
    let index = 0;
    while (`description${index}` in object){
        itemsextr.push({
            "description" : object[`description${index}`],
            "qty" : parseInt(object[`qty${index}`]),
            "price" : parseFloat(object[`price${index}`])
        });
        index++;
    }
    console.log(itemsextr)
    return itemsextr;
}

function makePriceTemplate(array){
    // console.log(array)
    let templateOfPrice = ``;
    let total = 0;
    array.forEach(element => {
        templateOfPrice += `<tr>
                        <td>${element["description"]}</td>
                        <td>${element["qty"]}</td>
                        <td>${element["price"]}</td>
                        <td>${element["price"] * element["qty"]}</td>
                    </tr>`
        total += (element["price"] * element["qty"])
    });
    return [templateOfPrice,total];
}

// function to genrate PDF
async function generatePDF() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Read HTML file content
    const htmlContent = await fs.readFile(path.join(__dirname, '/public/template.html'), 'utf8');

    // Load HTML into Puppeteer
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF with full styling
    await page.pdf({
        path: './public/output.pdf',
        format: 'A4',
        printBackground: true, // Ensures background colors and styles are applied
    });

    await browser.close();
    console.log('✅ PDF Generated Successfully: output.pdf');
}

// Run the function
// generatePDF();


app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/public/index.html");
});


// Check pdf status
let pdfReady = false

app.get("/checkPDFStatus",(req,res)=>{
        res.json({ status : pdfReady})
})





app.post("/submit",async(req,res)=>{
    // console.log(req.body)

    try{
        makeTemplate(req.body);
        await fs.writeFile("./public/template.html",template,(err)=>{
            if(err) throw err;
            console.log("🤝 template.html has been created")
        });
        await generatePDF();
        pdfReady = true
        res.status(204).end()
    }
    catch(err){
        console.log(err)
    }
    // res.sendFile(__dirname + "/public/index.html")
});






app.listen(port,()=>{
    console.log(`server is running PORT ${port}`)
})

