document.addEventListener("DOMContentLoaded", function () {
    const loginLink = document.getElementById("loginLink");
    const signUpLink = document.getElementById("signuplink");
    const logoutLink = document.getElementById("logoutLink");
    const profileIcon = document.getElementById("profileIcon");
    const userEmailTooltip = document.getElementById("userEmailTooltip");
    const checkoutBtn = document.getElementById("checkout-btn");
    const authPopup = document.getElementById("auth-popup");
    const closePopup = document.getElementById("close-popup");
    const cartItemsContainer = document.querySelector(".cart-items");
    const cartSidebar = document.querySelector(".cart-sidebar");
    const cartToggleBtn = document.querySelector(".cart-toggle");
    const cartCloseBtn = document.querySelector(".cart-close");
    const cartCountElement = document.getElementById("cart-count");
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    const customizeButtons = document.querySelectorAll(".customize-btn");
    const customizationPanels = document.querySelectorAll(".customization-panel");
    // Fetch and display previous orders from backend
    const reorderLink = document.getElementById('reorderLink');
    const reorderPanel = document.getElementById('reorderPanel');
    const reorderOrdersContainer = document.getElementById("reorder-orders-container");
    if (!reorderOrdersContainer) {
        console.error("reorder-orders-container element not found!");
        return;
    }

    let cart = [];
    const userEmail = localStorage.getItem("userEmail");
    
    // Update UI based on login status
    if (userEmail) {
        loginLink.style.display = "none";
        signUpLink.style.display = "none";
        logoutLink.style.display = "inline-block";
        userEmailTooltip.textContent = userEmail;
    }

    profileIcon.addEventListener("mouseenter", () => {
        if (userEmail) userEmailTooltip.style.display = "block";
    });
    profileIcon.addEventListener("mouseleave", () => {
        userEmailTooltip.style.display = "none";
    });
    logoutLink.addEventListener("click", () => {
        localStorage.removeItem("userEmail");
        window.location.reload();
    });

    // Toggle cart sidebar
    if (cartToggleBtn) cartToggleBtn.addEventListener("click", () => cartSidebar.classList.add("open"));
    if (cartCloseBtn) cartCloseBtn.addEventListener("click", () => cartSidebar.classList.remove("open"));

    customizeButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            // First check login
            if (!userEmail) {
                event.preventDefault(); 
    
                // 🛑 Hide all customization panels immediately!
                customizationPanels.forEach(panel => panel.classList.remove("active"));
    
                // Show the popup
                showPopup("Please log in first to customize your coffee!");
                return; // Stop further code
            }
    
            // If logged in, continue...
    
            // Hide all customization panels first
            customizationPanels.forEach(panel => panel.classList.remove("active"));
    
            const productCard = event.target.closest(".product-card");
            const customizationPanel = productCard.querySelector(".customization-panel");
    
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

    // Save customizations
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
    
    // Add to cart
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
    
        updateCartCount();
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

    checkoutBtn.addEventListener("click", function () {
        if (!userEmail) {
            window.location.href = "login_page.html"; // Replace with your actual login page URL
            return;
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        window.location.href = "checkout.html";
    });
    
    if (closePopup) {
        closePopup.addEventListener("click", () => {
            if (authPopup) {
                authPopup.style.visibility = "hidden";
                authPopup.style.opacity = "0";
            }
        });
    }
       
    // Reorder panel functionality
    if (reorderLink) {
        reorderLink.addEventListener("click", async function (event) {
            event.preventDefault();
            if (!userEmail) {
                window.location.href = "login_page.html";
                return;
            }
            if (reorderPanel) {
                reorderPanel.classList.add("active");
                await fetchPreviousOrders();
            }
        });
    }

    // Close when clicked outside
    if (reorderPanel) {
        window.addEventListener("click", function (e) {
            if (reorderPanel.classList.contains("active") &&
                !reorderPanel.contains(e.target) &&
                !e.target.closest('#reorderLink')) {
                reorderPanel.classList.remove("active");
            }
        });
    }
    
    // Function to fetch and display previous orders
    async function fetchPreviousOrders() {
        try {
            const userEmail = localStorage.getItem("userEmail");
            if (!userEmail) return;

            const response = await fetch(`http://localhost:3000/api/orders?email=${encodeURIComponent(userEmail)}`, {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched orders:", data); // Debug log

            if (!data || data.length === 0) {
                reorderOrdersContainer.innerHTML = "<p>No previous orders found.</p>";
                return;
            }

            const groupedByOrderId = {};

            data.forEach(order => {
                if (!groupedByOrderId[order.order_id]) groupedByOrderId[order.order_id] = [];
                groupedByOrderId[order.order_id].push(order);
            });

            reorderOrdersContainer.innerHTML = "";

            Object.entries(groupedByOrderId).forEach(([orderId, items]) => {
                const orderPanel = document.createElement("div");
                orderPanel.classList.add("order-panel");

                let itemsHTML = items.map(item => {
                    // Parse the items string to extract individual items
                    const itemsList = item.items.split('|').map(itemStr => {
                        const parts = itemStr.trim().split('-');
                        const namePart = parts[0].trim();
                        const nameMatch = namePart.match(/(.*?)\s*\((\d+)x\)/);
                        
                        if (!nameMatch) return null;

                        const name = nameMatch[1].trim();
                        const quantity = parseInt(nameMatch[2]);
                        
                        const details = {};
                        parts.slice(1).forEach(part => {
                            const [key, value] = part.split(':').map(s => s.trim());
                            if (key && value) {
                                details[key.toLowerCase()] = value;
                            }
                        });

                        // Calculate base price based on product name
                        let basePrice = 0;
                        if (name.includes("NESCAFÉ Gold Blend")) basePrice = 180;
                        else if (name.includes("NESCAFÉ Classic")) basePrice = 150;
                        else if (name.includes("NESCAFÉ Decaf")) basePrice = 170;
                        else if (name.includes("NESCAFÉ Latte")) basePrice = 200;
                        else if (name.includes("NESCAFÉ Mocha")) basePrice = 210;
                        else if (name.includes("Croissant")) basePrice = 50;
                        else if (name.includes("Cookies")) basePrice = 60;
                        else if (name.includes("Muffin")) basePrice = 55;
                        else if (name.includes("Sandwich")) basePrice = 90;
                        else if (name.includes("Bagel")) basePrice = 80;

                        // Calculate additional costs for customizations
                        let additionalCost = 0;
                        if (details.size === "Medium") additionalCost += 20;
                        if (details.size === "Large") additionalCost += 40;

                        if (details.sugar && details.sugar.includes("tsp")) {
                            const teaspoons = parseInt(details.sugar.replace("tsp", "").trim()) || 0;
                            additionalCost += teaspoons * 5;
                        }

                        if (details.toppings && details.toppings.trim().toLowerCase() !== "none") {
                            additionalCost += 30;
                        }

                        const itemPrice = basePrice + additionalCost;

                        return {
                            name,
                            quantity,
                            size: details.size || "Default Size",
                            sugar: details.sugar || "No Sugar",
                            milk: details.milk || "Default Milk",
                            toppings: details.toppings || "None",
                            price: itemPrice
                        };
                    }).filter(item => item !== null);

                    return itemsList.map(item => {
                        // Check if item is a coffee
                        const isCoffee = item.name.includes("NESCAFÉ");
                        
                        let detailsHTML = `<h4>${item.name}</h4>`;
                        
                        // Only show size for coffee items
                        if (isCoffee && item.size !== "Default Size") {
                            detailsHTML += `<p><strong>Size:</strong> ${item.size}</p>`;
                        }
                        
                        // Only show sugar if it's not "No Sugar"
                        if (item.sugar !== "No Sugar") {
                            detailsHTML += `<p><strong>Sugar:</strong> ${item.sugar}</p>`;
                        }
                        
                        // Only show milk type for coffee items
                        if (isCoffee && item.milk !== "Default Milk") {
                            detailsHTML += `<p><strong>Milk:</strong> ${item.milk}</p>`;
                        }
                        
                        // Only show toppings for coffee items if they exist
                        if (isCoffee && item.toppings && item.toppings !== "None" && item.toppings.trim() !== "") {
                            detailsHTML += `<p><strong>Toppings:</strong> ${item.toppings}</p>`;
                        }
                        
                        detailsHTML += `
                            <p><strong>Quantity:</strong> ${item.quantity}</p>
                            <p><strong>Price:</strong> ₹${item.price.toFixed(2)}</p>
                        `;

                        return `
                            <div class="order-item">
                                ${detailsHTML}
                            </div>
                        `;
                    }).join('');
                }).join("");

                const totalPrice = parseFloat(items[0].total_price) || 0;
                const orderDate = items[0].order_time ? new Date(items[0].order_time).toLocaleString() : "Unknown Date";

                orderPanel.innerHTML = `
                    <div class="order-info">
                        <h3>Order #${orderId}</h3>
                        <p class="order-total">Total: ₹${totalPrice.toFixed(2)}</p>
                        <p class="order-date">Date: ${orderDate}</p>
                        ${itemsHTML}
                        <button class="customize-btn reorder-btn" data-items='${JSON.stringify(items)}'>Reorder</button>
                    </div>
                `;

                reorderOrdersContainer.appendChild(orderPanel);
            });

            // Add reorder-to-cart logic
            document.querySelectorAll(".reorder-btn").forEach(button => {
                button.addEventListener("click", () => {
                    const itemsToAdd = JSON.parse(button.dataset.items);

                    itemsToAdd.forEach(item => {
                        // Parse the items string to extract individual items
                        const itemsList = item.items.split('|').map(itemStr => {
                            const parts = itemStr.trim().split('-');
                            const namePart = parts[0].trim();
                            const nameMatch = namePart.match(/(.*?)\s*\((\d+)x\)/);
                            
                            if (!nameMatch) return null;

                            const name = nameMatch[1].trim();
                            const quantity = parseInt(nameMatch[2]);
                            
                            const details = {};
                            parts.slice(1).forEach(part => {
                                const [key, value] = part.split(':').map(s => s.trim());
                                if (key && value) {
                                    details[key.toLowerCase()] = value;
                                }
                            });

                            // Calculate base price based on product name
                            let basePrice = 0;
                            if (name.includes("NESCAFÉ Gold Blend")) basePrice = 180;
                            else if (name.includes("NESCAFÉ Classic")) basePrice = 150;
                            else if (name.includes("NESCAFÉ Decaf")) basePrice = 170;
                            else if (name.includes("NESCAFÉ Latte")) basePrice = 200;
                            else if (name.includes("NESCAFÉ Mocha")) basePrice = 210;
                            else if (name.includes("Croissant")) basePrice = 50;
                            else if (name.includes("Cookies")) basePrice = 60;
                            else if (name.includes("Muffin")) basePrice = 55;
                            else if (name.includes("Sandwich")) basePrice = 90;
                            else if (name.includes("Bagel")) basePrice = 80;

                            // Calculate additional costs for customizations
                            let additionalCost = 0;
                            if (details.size === "Medium") additionalCost += 20;
                            if (details.size === "Large") additionalCost += 40;

                            if (details.sugar && details.sugar.includes("tsp")) {
                                const teaspoons = parseInt(details.sugar.replace("tsp", "").trim()) || 0;
                                additionalCost += teaspoons * 5;
                            }

                            if (details.toppings && details.toppings.trim().toLowerCase() !== "none") {
                                additionalCost += 30;
                            }

                            const itemPrice = basePrice + additionalCost;

                            return {
                                title: name,
                                quantity,
                                size: details.size || "Default Size",
                                sugar: details.sugar || "No Sugar",
                                milk: details.milk || "Default Milk",
                                toppings: details.toppings || "None",
                                price: itemPrice,
                                isCoffee: name.includes("NESCAFÉ")
                            };
                        }).filter(item => item !== null);

                        itemsList.forEach(cartItem => {
                            // Check if the product already exists in the cart
                            const existingItem = cart.find(existing => 
                                existing.title === cartItem.title &&
                                existing.size === cartItem.size &&
                                existing.sugar === cartItem.sugar &&
                                existing.milk === cartItem.milk &&
                                existing.toppings === cartItem.toppings
                            );

                            if (existingItem) {
                                existingItem.quantity += cartItem.quantity;
                            } else {
                                // Only include coffee-specific attributes for coffee items
                                const cartItemToAdd = {
                                    title: cartItem.title,
                                    quantity: cartItem.quantity,
                                    price: cartItem.price
                                };

                                if (cartItem.isCoffee) {
                                    cartItemToAdd.size = cartItem.size;
                                    cartItemToAdd.sugar = cartItem.sugar;
                                    cartItemToAdd.milk = cartItem.milk;
                                    if (cartItem.toppings !== "None") {
                                        cartItemToAdd.toppings = cartItem.toppings;
                                    }
                                }

                                cart.push(cartItemToAdd);
                            }
                        });
                    });

                    updateCartUI();
                });
            });
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            reorderOrdersContainer.innerHTML = `<p>Error loading orders: ${error.message}</p>`;
        }
    }

    // Function to show the popup message
    function showPopup(message) {
        const popup = document.createElement("div");
        popup.classList.add("popup-message");

        const popupContent = document.createElement("div");
        popupContent.classList.add("popup-content");

        const popupText = document.createElement("p");
        popupText.textContent = message;

        const popupClose = document.createElement("button");
        popupClose.id = "popupClose";
        popupClose.textContent = "Close";

        popupClose.addEventListener("click", () => {
            popup.remove();
        });

        popupContent.appendChild(popupText);
        popupContent.appendChild(popupClose);
        popup.appendChild(popupContent);

        document.body.appendChild(popup);
    }

});
