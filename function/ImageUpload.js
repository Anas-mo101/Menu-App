const path = require('path');

const uploadImage = (file,dir) =>{ // returns undefined ??!
    var image_name = file.name;
    const extensionName = path.extname(image_name);
    const allowedExtension = ['.png','.jpg','.jpeg'];

    if(allowedExtension.includes(extensionName)){
        const path = dir + "/public/img/" + image_name;
        file.mv(path, function (err){
            if(err){
                console.log("Error: " + err)
            }else{
                console.log("img success: " + image_name);
            }
        });
        return image_name;
    }else{
        console.log("Wrong Extenstion");
        res.redirect('/edit-menu');
        return "";
    }
}

module.exports = uploadImage;