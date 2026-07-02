function addCart() {
    alert("カートに追加しました！");
}

function showProducts(){
    alert("商品一覧を表示します！");
}
function searchProduct(){

    let word = prompt("商品名を入力してください");

    if(word == null){
        return;
    }

    alert(word + " を検索しました。");

}
