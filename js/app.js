//grap all
const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDom = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotalAmount = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDom = document.querySelector('.products-center')

const left_nav = document.querySelector('.fa-bars')
const left_nav_overlay = document.querySelector('#cart-overlay1')
const left_nav_content = document.querySelector('#cart1')
const closeManu = document.querySelector('#fa-window-close')
left_nav.addEventListener('click', (e) => {
    left_nav_overlay.classList.add("transparentBcg")
    left_nav_content.classList.add("showCart")
    // console.log(e);
})
closeManu.addEventListener('click', (e) => {
    left_nav_overlay.classList.remove("transparentBcg")
    left_nav_content.classList.remove("showCart")
})

//cart home
let cart = []
//button
let buttonDOM = []

//getting products
class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json')
            let data = await result.json()
            let products = data.items
            products = products.map(item => {
                const { title, price } = item.fields
                const { id } = item.sys
                const image = item.fields.image.fields.file.url
                return { title, price, id, image }
            })
            return products
        } catch (error) {
            console.log(error);
        }
    }
}
//display products
class UI {
    displayProducts(products) {
        let result = ''
        products.forEach(product => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img class="product-img" src=${product.image} alt="product">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            `
        });
        productsDom.innerHTML = result
    }
    getBagButtons() {
        const bagBtn = [...document.querySelectorAll('.bag-btn')]
        buttonDOM = bagBtn;
        // console.log(bagBtn);
        bagBtn.forEach(button => {
            let id = button.dataset.id//to get button id data-id=""
            let inCart = cart.find(item => item.id === id)
            if (inCart) {
                button.innerText = "In Cart"
                button.disabled = true
            }
            button.addEventListener("click", (event) => {
                event.target.innerText = "In Cart"
                event.target.disabled = true
                // get product form products
                let cartItem = { ...Storage.getProduct(id), amount: 1 }
                //add tham in card array
                cart = [...cart, cartItem]
                //svae into local storage
                Storage.saveCart(cart)
                //set card value
                this.setCartValue(cart)
                //display card item
                this.addCartItem(cartItem)
                //show the card
                this.showCart()
            })
        })
    }
    setCartValue(cart) {
        let tempTotal = 0
        let itemsTotal = 0
        cart.map(item => {
            tempTotal += item.price * item.amount
            itemsTotal += item.amount
        })
        cartTotalAmount.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal
    }
    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add("cart-item")
        div.innerHTML = `
        <img src=${item.image} alt=${item.title}>
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
        `
        cartContent.appendChild(div)
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg')
        cartDom.classList.add('showCart')
    }
    setupApp() {
        cart = Storage.getCart()
        this.setCartValue(cart)
        this.populate(cart)
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
        cartOverlay.addEventListener('click', function (e) {
            if (e.target == cartOverlay) {
                cartOverlay.classList.remove('transparentBcg')
                cartDom.classList.remove('showCart')
            }
        })
    }
    populate(cart) {
        cart.forEach(item => this.addCartItem(item))
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDom.classList.remove('showCart')
    }
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        })
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target
                let id = removeItem.dataset.id
                // console.log(removeItem.parentElement.parentElement);
                cartContent.removeChild(removeItem.parentElement.parentElement)
                // console.log(id);
                this.removeItem(id)
            } else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target
                let id = addAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount + 1
                Storage.saveCart(cart)
                this.setCartValue(cart)
                addAmount.nextElementSibling.innerText = tempItem.amount
            } else if (event.target.classList.contains('fa-chevron-down')) {
                let minusAmount = event.target
                let id = minusAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart)
                    this.setCartValue(cart)
                    minusAmount.previousElementSibling.innerText = tempItem.amount
                } else {
                    cartContent.removeChild(minusAmount.parentElement.parentElement)
                    this.removeItem(id)
                }
            }
        })
    }
    clearCart() {
        let cartItems = cart.map(item => item.id)
        cartItems.forEach(id => this.removeItem(id))
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValue(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
    }
    getSingleButton(id) {
        return buttonDOM.find(button => button.dataset.id === id)
    }
}
//local mamori/storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        //i can use if but it's ok
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI()
    const products = new Products()
    // set App
    ui.setupApp()
    //get products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons()
        ui.cartLogic()
    })
})