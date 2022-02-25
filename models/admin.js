const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const ASchema = mongoose.Schema;

const adminSchema = new ASchema({
    id: 
    {
        type: String,
        required: true,
        unique: true
    },
    name: 
    {
        type: String,
        required: true,
    },
    restname: 
    {
        type: String,
        required: true,
        unique: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true,
        validate: (value) => {
        return validator.isEmail(value)
        }
    },
    password:
    {
        type: String,
        required: true,
    },
    settings: {
        theme: {
            rest_name: 
            {
                type: String,
                required: true
            },
            logo: 
            {
                type: String,
                required: true
            },
            bckground:
            {
                type: String,
                required: true
            },
            color_one:
            {
                type: String,
                required: true,
            },
            color_two:
            {
                type: String,
                required: true,
            }
        },
        category: [
            {
                id: 
                {
                    type: String,
                    required: true,
                    unique: true
                },
                name: 
                {
                    type: String,
                    required: true
                }
            }
        ],
        menu: [
            {
                id: 
                {
                    type: String,
                    required: true,
                    unique: true
                },
                name: 
                {
                    type: String,
                    required: true
                },
                desc:
                {
                    type: String
                },
                cate:
                {
                    type: String,
                    required: true,
                },
                price:
                {
                    type: String,
                    required: true,
                },
                availablty:
                {
                    type: Boolean,
                    required: true,
                },
                img:
                {
                    type: String
                }
            }
        ]
    }
}, {timestamps: true});


adminSchema.pre('save', async function(next){      // encrypting user data before its saved
    try {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(this.password, salt);
        this.password = hashed;
        next();
    } catch (error) {
        next(error);
    }
});

const Admin = mongoose.model('admin', adminSchema);
module.exports = Admin;