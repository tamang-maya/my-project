// --- 1. API連携・通貨変換用の設定 ---
let nprRate = 0; // APIから取得するネパール・ルピーのリアルタイムレートを保存する変数
let isNPR = false; // 現在の表示がルピー(NPR)かどうかを判定するフラグ

// ページ読み込み時に自動で無料のライブ為替APIを呼び出す

fetch("https://open.er-api.com/v6/latest/JPY")
    .then(response => {
        if (!response.ok) throw new Error('APIリクエストに失敗しました');
        return response.json();
    })
    .then(data => {
        // 日本円(JPY)からネパール・ルピー(NPR)への最新レートを保存
        nprRate = data.rates.NPR;
        document.getElementById('api-status').innerText = `接続完了! 1 JPY = ${nprRate.toFixed(2)} NPR`;
        console.log("APIから取得した最新為替レート:", data);
    })
    .catch(error => {
        console.error('API接続エラー:', error);
        document.getElementById('api-status').innerText = "オフライン (予備の固定レートを使用中)";
        nprRate = 0.88; // 万が一APIが落ちていた場合のバックアップレート
    });

// ボタンが押されたときに、画面上のすべての商品の価格表記をルピーに変換する関数
function convertToNPR() {
    if (nprRate === 0) {
        alert("APIデータを読み込み中です。少々お待ちください。");
        return;
    }

    // 表示状態を反転
    isNPR = !isNPR;

    const products = document.querySelectorAll('.product');
    products.forEach(product => {
        // HTMLの data-price 属性から元の円価格を取得
        const yenPrice = parseInt(product.getAttribute('data-price'));
        const priceDisplay = product.querySelector('.price-display');

        if (isNPR) {
            // ルピーに変換して表示
            const nprPrice = Math.round(yenPrice * nprRate);
            priceDisplay.innerText = `Rs. ${nprPrice.toLocaleString()} (¥${yenPrice.toLocaleString()})`;
        } else {
            // 元の日本円表示に戻す
            priceDisplay.innerText = `¥${yenPrice.toLocaleString()}`;
        }
    });

    // カートの中身と合計金額も新しい通貨状態に合わせて再計算・再表示する
    displayCart();
}

// --- 2. あなたが作成した既存の関数（API対応にアップデート） ---
let cart = [];

function addCart(button) {
    const product = button.parentElement;
    const name = product.querySelector("h2").textContent;
    // カート追加時に、通貨変換でバグが起きないよう元の「data-price」から純粋な数値を保存
    const originalPrice = product.getAttribute('data-price');

    cart.push({
        name: name,
        price: Number(originalPrice)
    });
    displayCart();
}

function showProduct(button) {
    const product = button.parentElement;
    const img = product.querySelector("img").src;
    const name = product.querySelector("h2").textContent;
    const currentPriceText = product.querySelector(".price-display").textContent;

    document.getElementById("popupImg").src = img;
    document.getElementById("popupTitle").textContent = name;
    document.getElementById("popupPrice").textContent = currentPriceText; // 現在表示中の価格（円かルピー）をそのままポップアップに反映

    document.getElementById("popup").style.display = "flex";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

function searchProducts() {
    const searchTerm = document.getElementById("searchbox").value.toLowerCase();
    const products = document.querySelectorAll(".product");

    products.forEach(function (product) {
        const name = product.querySelector("h2").textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
}

function showALLProducts() {
    const products = document.querySelectorAll(".product");
    products.forEach(function (product) {
        product.style.display = "block";
    });
    document.getElementById("searchbox").value = "";
}

function displayCart() {
    const cartItems = document.getElementById("cartItems");
    const totalPrice = document.getElementById("totalPrice");

    cartItems.innerHTML = "";
    let totalYen = 0;

    cart.forEach(function (item, index) {
        const div = document.createElement("div");
        totalYen += item.price;

        // 現在の表示モード（円 or ルピー）に合わせてカート内の価格表記を切り替える
        let itemPriceText = "";
        if (isNPR && nprRate > 0) {
            const nprPrice = Math.round(item.price * nprRate);
            itemPriceText = `Rs. ${nprPrice.toLocaleString()}`;
        } else {
            itemPriceText = `¥${item.price.toLocaleString()}`;
        }

        div.innerHTML = `${item.name} ${itemPriceText} <button onclick="removeCart(${index})">削除</button>`;
        cartItems.appendChild(div);
    });

    if (cart.length == 0) {
        cartItems.innerHTML = "<p>カートは空です。</p>";
    }

    // カートの総合計金額の表示を切り替える
    if (isNPR && nprRate > 0) {
        const totalNpr = Math.round(totalYen * nprRate);
        totalPrice.textContent = `Rs. ${totalNpr.toLocaleString()}`;
    } else {
        totalPrice.textContent = `¥${totalYen.toLocaleString()}`;
    }
}

function removeCart(index) {
    cart.splice(index, 1);
    displayCart();
}

// ダミー用のshowProducts関数（HTMLのボタン用エラー防止）
function showProducts() {

    showALLProducts();

    document.querySelector(".products").scrollIntoView({
        behavior: "smooth"
    });

}

// 購入手続きボタン用
function checkout() {
    alert("ご購入ありがとうございます！ネパールへのお届け手続きを開始します。");
}

function enterSearch(event) {

    if (event.key === "Enter") {

        searchProducts();

    }

}
