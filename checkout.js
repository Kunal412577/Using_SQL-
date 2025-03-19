document.addEventListener("DOMContentLoaded", function () {
    const subtotalElement = document.getElementById("subtotal");
    const cgstElement = document.getElementById("cgst");
    const sgstElement = document.getElementById("sgst");
    const grandTotalElement = document.getElementById("grand-total");
    const cartItemsContainer = document.querySelector(".cart-items");
    const cashInput = document.getElementById("cashGiven");
    const changeReturnedElement = document.getElementById("changeReturned");
    const confirmPaymentButton = document.getElementById("confirm-payment");

    // Check if Elements Exist
    if (!subtotalElement || !cgstElement || !sgstElement || !grandTotalElement || !cashInput || !changeReturnedElement || !cartItemsContainer) {
        console.error("One or more elements not found!");
        return;
    }

    // Retrieve Cart Data
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    console.log("Loaded Cart:", cart);

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let subtotal = 0;

    // Populate Cart Summary
    cart.forEach((item) => {
        let itemTotal = parseFloat(item.price) * parseInt(item.quantity);
        if (!isNaN(itemTotal) && itemTotal > 0) {
            subtotal += itemTotal;
        } else {
            console.error("Invalid item data:", item);
        }

        // Create Cart Item Display
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <h4>${item.title}</h4>
            <p><strong>Size:</strong> ${item.size || "Default"}</p>
            <p><strong>Sugar:</strong> ${item.sugar || "No Sugar"}</p>
            <p><strong>Milk:</strong> ${item.milk || "Regular"}</p>
            ${item.toppings && item.toppings.toLowerCase() !== "none" ? `<p><strong>Toppings:</strong> ${item.toppings}</p>` : ""}
            <p><strong>Quantity:</strong> ${item.quantity}</p>
            <p><strong>Price:</strong> ₹${(item.price * item.quantity).toFixed(2)}/-</p>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    // Calculate Taxes
    let cgst = subtotal * 0.09;
    let sgst = subtotal * 0.09;
    let grandTotal = subtotal + cgst + sgst;

    // Update UI
    subtotalElement.innerText = `₹${subtotal.toFixed(2)}/-`;
    cgstElement.innerText = `₹${cgst.toFixed(2)}/-`;
    sgstElement.innerText = `₹${sgst.toFixed(2)}/-`;
    grandTotalElement.innerText = `₹${grandTotal.toFixed(2)}/-`;

    console.log("Subtotal:", subtotal);
    console.log("CGST:", cgst);
    console.log("SGST:", sgst);
    console.log("Grand Total:", grandTotal);

    // **Live Update for Change Returned**
    cashInput.addEventListener("input", function () {
        let cashGiven = parseFloat(cashInput.value) || 0;
        let changeReturned = cashGiven - grandTotal;

        if (changeReturned < 0) {
            changeReturnedElement.innerText = "Not enough cash!";
            changeReturnedElement.style.color = "red";
        } else {
            changeReturnedElement.innerText = `₹${changeReturned.toFixed(2)}/-`;
            changeReturnedElement.style.color = "black";
        }
    });

    // Confirm Payment Button Click
    confirmPaymentButton.addEventListener("click", function () {
        let cashGiven = parseFloat(cashInput.value);
    
        if (isNaN(cashGiven) || cashGiven < grandTotal) {
            alert("Invalid cash amount or insufficient cash!");
            return;
        }
    
        let changeReturned = cashGiven - grandTotal;
        changeReturnedElement.innerText = `₹${changeReturned.toFixed(2)}/-`;
    
        alert("Payment Successful! Change Returned: ₹" + changeReturned.toFixed(2));
    
        localStorage.removeItem("cart"); // Clear cart after payment
    
        // Redirect to main page
        window.location.href = "main_page.html"; // Update with your actual file name if different
    });
    
});
