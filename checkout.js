document.addEventListener("DOMContentLoaded", function () {
    // Initialize elements object
    const elements = {
        subtotal: document.getElementById("subtotal"),
        cgst: document.getElementById("cgst"),
        sgst: document.getElementById("sgst"),
        grandTotal: document.getElementById("grand-total"),
        cartItems: document.querySelector(".cart-items"),
        confirmPayment: document.getElementById("confirm-payment")
    };

    if (!elements.subtotal || !elements.cgst || !elements.sgst || !elements.grandTotal || 
        !elements.cartItems || !elements.confirmPayment) {
        console.error("One or more elements not found!");
        return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    console.log("Loaded Cart:", cart);

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let subtotal = 0;

    // Render Cart Items
    cart.forEach((item) => {
        let itemPrice = parseFloat(item.price) || 0;
        let itemQuantity = parseInt(item.quantity) || 0;
        let itemTotal = itemPrice * itemQuantity;

        if (itemTotal > 0) {
            subtotal += itemTotal;
        } else {
            console.error("Invalid item data:", item);
        }

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        let cartContent = `<h4>${item.title}</h4>`;
        if (item.size && item.size.toLowerCase() !== "default size") {
            cartContent += `<p><strong>Size:</strong> ${item.size}</p>`;
        }
        if (item.sugar && item.sugar.toLowerCase() !== "no sugar") {
            cartContent += `<p><strong>Sugar:</strong> ${item.sugar}</p>`;
        }
        if (item.milk && item.milk.toLowerCase() !== "default milk") {
            cartContent += `<p><strong>Milk:</strong> ${item.milk}</p>`;
        }
        if (item.toppings && item.toppings.toLowerCase() !== "none") {
            cartContent += `<p><strong>Toppings:</strong> ${item.toppings}</p>`;
        }

        cartContent += `
            <p><strong>Quantity:</strong> ${itemQuantity}</p>
            <p><strong>Price:</strong> ₹${itemTotal.toFixed(2)}/-</p>
        `;

        cartItem.innerHTML = cartContent;
        elements.cartItems.appendChild(cartItem);
    });

    // Calculate Taxes
    let cgst = subtotal * 0.09;
    let sgst = subtotal * 0.09;
    let grandTotal = subtotal + cgst + sgst;

    // Update UI
    elements.subtotal.innerText = `₹${subtotal.toFixed(2)}/-`;
    elements.cgst.innerText = `₹${cgst.toFixed(2)}/-`;
    elements.sgst.innerText = `₹${sgst.toFixed(2)}/-`;
    elements.grandTotal.innerText = `₹${grandTotal.toFixed(2)}/-`;

    // Confirm Payment Button
    elements.confirmPayment.addEventListener("click", function () {
        // alert("Payment Successful via Google Pay!");

        // Save necessary data to localStorage for next page
        const checkoutItems = cart.map(item => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            sugar: item.sugar,
            milk: item.milk,
            toppings: item.toppings
        }));

        localStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
        localStorage.setItem("checkoutTotal", grandTotal.toFixed(2));

        // Send Order to Server
        fetch("http://localhost:3000/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: localStorage.getItem("userEmail") || "guest@nescafe.com",
                total: grandTotal.toFixed(2),
                cartItems: checkoutItems,
                paymentMethod: "gpay" // Specifying Google Pay
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Order Response:", data);
            localStorage.removeItem("cart"); // Clear cart after successful order

            // Redirect to the next page
            window.location.href = "tstchekout.html"; // Adjust URL as per your setup
        })
        .catch(err => {
            console.error("Checkout Error:", err);
            alert("Error processing order. Please try again.");
        });
    });
});
