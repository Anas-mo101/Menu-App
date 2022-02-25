function catedropdown(skip,flag,menu){
    if(flag){
        var dropdown;
        for (let cate of menu) { 
            if(cate.name != skip){
                dropdown = `<option > ${cate.name} </option> ` + dropdown;
            }
        }
        return dropdown;
    }else{
        for(let element of document.getElementsByClassName('addnewcategory-dropdown')){
            for (let cate of menu) {
                const x = `<option > ${cate.name} </option> `;
                element.innerHTML = element.innerHTML + x;
            }
        }
    }
}


fetch("http://localhost:3000/api/admin")
.then((response) => {
    return response.json();
})
.then((data) => {
    
    for (let cate of data.category) {
        const x = `<li> <a class="cateitem" id="${cate.id}">${cate.name}</a> </li> `;
        document.getElementById('categmenu').innerHTML = document.getElementById('categmenu').innerHTML + x;   
    }

    for (let item of data.menu) { 
        const x = ` 
        <div class="product-box ${item.cate}" id="${item.id}" style="display: none;">
            <div class="container">
                <img src="/img/${item.img}" alt="cookies" class="item-image" style="" />
                <div class="information">
                    <div class="name">${item.name}</div>
                    <div class="descr">${item.desc}</div>
                    <div class="price">MYR${item.price}</div>
                    <div class="options">
                        <div class="option" id="up${item.id}"> <a> Update item </a> </div>
                        <div class="option" id="del${item.id}"> <a> Delete </a> </div>
                    </div>
                </div>
                <div id="update-${item.id}" style="display: none;" class="opt">
                    <h3> Update </h3>
                    <form class="box" action="/update/menu/${item.id}" method="POST" enctype="multipart/form-data">
                        <input type="checkbox" name="available" value="available" checked>
                        <label for="available"> Available </label><br>
                        <input type="text" name="name" placeholder="new  name" value="${item.name}" required>
                        <input type="text" name="desc" placeholder="new description" value="${item.desc}" >
                        <input type="number" step="0.01" name="price" placeholder="new price" value="${item.price}" required>
                        <select class="catedropdown" id="catedropdown" name="cate" required>
                            <option selected> ${item.cate} </option> 
                            `
                            + catedropdown(item.cate,true,data.category) + 
                            ` 
                        </select>
                        <input type="file" name="image" accept=".png,.jpg,.jpeg">
                        <input type="submit" name="" value="update">
                    </form>
                </div>
                <div id="delete-${item.id}" style="display: none;" class="opt">
                    <h3> Delete </h3>
                    <p> Are you sure you want to delete ? </p>
                    <form class="box" action="/delete/menu/${item.id}" method="POST" enctype="multipart/form-data">
                        <input type="submit" name="" value="delete">
                    </form>
                </div>
                <div style="padding: 10px 0;">  </div>
            </div> 
        </div> `;
        document.getElementById('menu').innerHTML = document.getElementById('menu').innerHTML + x;
    }

    catedropdown("",false,data.category);

    document.getElementById("add-new").addEventListener('click', (e) => {
        var addform = document.getElementById("add-form");
        if(addform.style.display == "none"){
            addform.style.display = "block";
        }else{
            addform.style.display = "none";
        }
    })
    
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
    
    
    for(let option of document.getElementsByClassName("option")){
        option.addEventListener('click', (e) => {
    
            for (const element of document.getElementsByClassName("opt")){
                if(element.style.display != "none"){
                    element.style.display="none";
                }
            }
    
            var tar = e.target.innerHTML;
            console.log(tar);
            if(tar.trim() == "Update item"){
                var tempp = document.getElementById("delete-" + option.getAttribute("id").slice(2) );
                if(tempp.style.display == "block"){
                    tempp.style.display = "none";
                }
    
                var temp = document.getElementById("update-" + option.getAttribute("id").slice(2) );
                if(temp.style.display != "block"){
                    temp.style.display = "block";
                }else{
                    temp.style.display = "none";
                }
            }else if(tar.trim() == "Delete"){
    
                var tempp = document.getElementById("update-" + option.getAttribute("id").slice(3) );
                if(tempp.style.display != "none"){
                    tempp.style.display = "none";
                }
                var temp = document.getElementById("delete-" + option.getAttribute("id").slice(3) );
                if(temp.style.display != "block"){
                    temp.style.display = "block";
                }else{
                    temp.style.display = "none";
                }
            }
        });
    }
});






