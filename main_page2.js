document.addEventListener("DOMContentLoaded", () => {
    const cart = [];
    const cartCountElement = document.getElementById("cart-count")
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    const cartSidebar = document.querySelector(".cart-sidebar");
    const cartItemsContainer = document.querySelector(".cart-items");
    const cartToggleBtn = document.querySelector(".cart-toggle");
    const cartCloseBtn = document.querySelector(".cart-close");
    const customizeButtons = document.querySelectorAll(".customize-btn");
    const customizationPanels = document.querySelectorAll(".customization-panel");

    let selectedSize = "Small";
    let selectedSugar = "No Sugar";
    let selectedMilk = "Regular Milk";
    let selectedToppings = "";

    // Open/Close Cart Sidebar
    if (cartToggleBtn) {
        cartToggleBtn.addEventListener("click", () => {
            cartSidebar.classList.add("open");
        });
    }

    if (cartCloseBtn) {
        cartCloseBtn.addEventListener("click", () => {
            cartSidebar.classList.remove("open");
        });
    }

    customizeButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            // Hide all customization panels
            customizationPanels.forEach(panel => panel.classList.remove("active"));

            // Get the parent product card
            const productCard = event.target.closest(".product-card");
            
            // Find the corresponding customization panel inside the product card
            const customizationPanel = productCard.querySelector(".customization-panel");
            
            // Show the customization panel for the selected coffee
            if (customizationPanel) {
                customizationPanel.classList.add("active");
            }
        });
    });

    // Close the customization panel
    const closeButtons = document.querySelectorAll(".close-panel");
    closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const customizationPanel = button.closest(".customization-panel");
            customizationPanel.classList.remove("active");
        });
    });


    document.querySelectorAll(".save-customization").forEach((button) => {
        button.addEventListener("click", (event) => {
            const customizationPanel = event.target.closest(".customization-panel");
            const productCard = customizationPanel.closest(".product-card");
    
            // Retrieve the base price (but don't modify it on the page)
            const basePrice = parseFloat(productCard.querySelector(".product-price").innerText.replace("₹", "").replace("/-", ""));
            
            // Retrieve customization values
            const selectedSize = customizationPanel.querySelector(".product-size").value;
            const selectedSugar = customizationPanel.querySelector(".product-sugar").value;
            const selectedMilk = customizationPanel.querySelector(".product-milk").value;
            const selectedToppings = customizationPanel.querySelector("#custom-toppings").value;
    
            // Calculate additional costs for customizations
            let additionalCost = 0;
            if (selectedSize === "Medium") additionalCost += 20;
            if (selectedSize === "Large") additionalCost += 40;

            if (selectedSugar !== "No Sugar" && selectedSugar.includes("tsp")) {
                const teaspoons = parseInt(selectedSugar.replace("tsp", "").trim()) || 0; // Extract the number of teaspoons
                additionalCost += teaspoons * 5;
            }
            if (selectedToppings.trim() !== "" && selectedToppings.toLowerCase() !== "none") additionalCost += 30;
    
            const finalPrice = basePrice + additionalCost; // Calculate final price
    
            // Save customization details and price in dataset for later use
            productCard.dataset.size = selectedSize;
            productCard.dataset.sugar = selectedSugar;
            productCard.dataset.milk = selectedMilk;
            productCard.dataset.toppings = selectedToppings;
            productCard.dataset.finalPrice = finalPrice; // Save the calculated price here
    
            // Hide the customization panel
            customizationPanel.classList.remove("active");
            // alert("Customization saved! Final price will be shown in the cart.");
        });
    });
    
  
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const productCard = button.closest(".product-card");
            if (!productCard) return;
    
            const title = productCard.querySelector(".product-title").innerText;
            const quantityElement = productCard.querySelector(".quantity-selector span");
            const quantity = quantityElement ? parseInt(quantityElement.innerText) : 1;
    
            // Retrieve saved customization details and final price
            const selectedSize = productCard.dataset.size || "Default Size";
            const selectedSugar = productCard.dataset.sugar || "No Sugar";
            const selectedMilk = productCard.dataset.milk || "Default Milk";
            const selectedToppings = productCard.dataset.toppings || "None";
            const finalPrice = parseFloat(productCard.dataset.finalPrice) || parseFloat(productCard.querySelector(".product-price").innerText.replace("₹", "").replace("/-", ""));
    
            // Check if the product already exists in the cart
            const existingProduct = cart.find(item => 
                item.title === title &&
                item.size === selectedSize &&
                item.sugar === selectedSugar &&
                item.milk === selectedMilk &&
                item.toppings === selectedToppings
            );
    
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.push({
                    title,
                    size: selectedSize,
                    sugar: selectedSugar,
                    milk: selectedMilk,
                    toppings: selectedToppings,
                    quantity,
                    price: finalPrice
                });
            }
    
            updateCartUI(); // Refresh the cart UI
        });
    });
    
    document.querySelectorAll(".quantity-selector").forEach((selector) => {
        const minusButton = selector.querySelector(".quantity-btn:first-child");
        const plusButton = selector.querySelector(".quantity-btn:last-child");
        const quantityDisplay = selector.querySelector("span");
    
        minusButton.addEventListener("click", () => {
            let currentQuantity = parseInt(quantityDisplay.innerText);
            if (currentQuantity > 1) {
                currentQuantity -= 1; // Decrement the quantity (minimum 1)
                quantityDisplay.innerText = currentQuantity;
            }
        });
    
        plusButton.addEventListener("click", () => {
            let currentQuantity = parseInt(quantityDisplay.innerText);
            currentQuantity += 1; // Increment the quantity
            quantityDisplay.innerText = currentQuantity;
        });
    });
    

    // Update Cart UI
    function updateCartUI() {
        cartItemsContainer.innerHTML = ""; // Clear the cart container
    
        cart.forEach((item, index) => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            
            // Dynamically build the cart item details
            let details = `<h4>${item.title}</h4>`;
            
            if (item.size && item.size !== "Default Size") {
                details += `<p><strong>Size:</strong> ${item.size}</p>`;
            }
            
            // Display Sugar only if it's not "No Sugar"
            if (item.sugar && item.sugar !== "No Sugar") {
                details += `<p><strong>Sugar:</strong> ${item.sugar}</p>`;
            }
            
            if (item.milk && item.milk !== "Default Milk") {
                details += `<p><strong>Milk:</strong> ${item.milk}</p>`;
            }
            
            // Display Toppings only if it's not empty or "None"
            if (item.toppings && item.toppings.trim().toLowerCase() !== "none" && item.toppings.trim() !== "") {
                details += `<p><strong>Toppings:</strong> ${item.toppings}</p>`;
            }
            
            details += `<p><strong>Quantity:</strong> ${item.quantity}</p>`;
            details += `<p><strong>Price:</strong> ₹${(item.price * item.quantity).toFixed(2)}</p>`; // Dynamic total price for this item
        
            // Add the dynamically built details to the cart item
            cartItem.innerHTML = `
                <div>
                    ${details}
                </div>
                <button class="remove-from-cart" data-index="${index}">Remove</button>
            `;
        
            cartItemsContainer.appendChild(cartItem);
        });
    
        // Add event listeners to "Remove" buttons
        document.querySelectorAll(".remove-from-cart").forEach((button) => {
            button.addEventListener("click", (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                if (!isNaN(index) && index >= 0 && index < cart.length) {
                    cart.splice(index, 1); // Remove the item from the cart
                    updateCartUI(); // Update the UI after removal
                }
            });
        });
    
        updateCartCount(); // Update the cart count indicator
    }
        
    // Function to update cart counter
    function updateCartCount() {
        let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartCountElement.textContent = totalItems;
            cartCountElement.style.visibility = "visible"; // Show count
        } else {
            cartCountElement.style.visibility = "hidden"; // Hide count
        }
    }
    document.getElementById("checkout-btn").addEventListener("click", function () {
        localStorage.setItem("cart", JSON.stringify(cart)); // Save cart to localStorage
        window.location.href = "checkout.html"; // Redirect to checkout
    });
});