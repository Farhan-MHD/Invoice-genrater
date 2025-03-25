let items = [];

function addItem() {
    const index = items.length;
    items.push({ description: "", qty: 1, price: 0 });

    const row = document.createElement("tr");
    row.id = `invoice-product${index}`
    row.innerHTML = `
        <td><input type="text" name="description${index}" oninput="updateItem(${index}, 'description', this.value)" placeholder="Enter description" required></td>
        <td><input type="number" name="qty${index}" value="1" min="1" oninput="updateItem(${index}, 'qty', this.value)" required></td>
        <td><input type="number" name="price${index}" value="0" min="0" step="0.01" oninput="updateItem(${index}, 'price', this.value)" required></td>
        <td><span id="total-${index}">0.00</span></td>
        <td class="close-btn"><button onclick="removeItem(${index})">❌</button></td>
    `;
    document.getElementById("invoice-items").appendChild(row);
    updateInvoice();
    console.log(items)
}

function updateItem(index, field, value) {
    // both are same line codes
    // items[index][field] = field === "description" ? value : parseFloat(value) || 0;
    if(field === "description"){
        items[index][field] = value
    }else{
        items[index][field] = parseFloat(value) || 0
    }
    updateInvoice();
    updateTotal();
}

function removeItem(index) {
    items.splice(index, 1);
    document.getElementById(`invoice-product${index}`).remove();
    // items.forEach((_, i) => addItem(i));
    updateInvoice();
    console.log(items)
}

function updateInvoice() {
    let subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    let tax = subtotal * 0.02;
    let grandTotal = subtotal + tax;

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("tax").textContent = tax.toFixed(2);
    document.getElementById("grand-total").textContent = grandTotal.toFixed(2);
}
function updateTotal(){
    items.forEach((item, i) => {
        document.getElementById(`total-${i}`).textContent = (item.qty * item.price).toFixed(2);
    });
};


// check PDF Status


function checkPDFStatus(){
    let checker = setInterval(async() => {
        try{
            let res = await fetch("/checkPDFStatus")
            let data = await res.json() 
            console.log(data)
            if(data.status){
                clearInterval(checker);
                document.querySelector('.load-animi').style.display = "none"
                document.querySelector('.download-pdf a').style.display = "block" ;
                document.querySelector('.download-pdf p').innerHTML = 'PDF has been genrated'
            }else{
                document.querySelector('.d-p-wraper').style.display = "block" ;
            }
        }
        catch(err){
            if(err)throw err;
        }
        
    
    }, 1000);
    
}

document.querySelector('.download-pdf a').addEventListener("click",()=>{
    document.querySelector('.d-p-wraper').style.display = 'none'
})