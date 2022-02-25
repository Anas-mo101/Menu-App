
for (let cate of data.category) { 
    const x = ` <li> <a class="cateitem" id="${cate.id}">${cate.name} </a> </li>`;
    document.getElementById('categmenu').innerHTML = document.getElementById('categmenu').innerHTML + x;
}

for (let item of data.menu) {
    if(item.availablty){
        const x = `
            <div class="product-box ${item.cate}" id="${item.id}" style="display: none;">
                <div class="container" >
                    <img src="http://localhost:3000/img/${item.img}" alt="menu-item" class="item-image" />
                    <div class="information">
                        <div class="name">${item.name}</div>
                        <div class="descr">${item.desc}</div>
                        <div class="price">MYR${item.price}</div>
                    </div> 
                    <div style="padding: 10px 0;">  </div>
                </div> 
            </div> 
        `;
        document.getElementById('menu').innerHTML = document.getElementById('menu').innerHTML + x;
    } 
}

for (const element of document.getElementsByClassName("cateitem")){
    element.addEventListener('click', (e) => {
      for (const element of document.getElementsByClassName("product-box")){
        element.style.display="none";
      }

      for (const element of document.getElementsByClassName(e.target.innerHTML)){
        element.style.display="block";
      }
    })
}