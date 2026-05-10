import { model, Schema } from "mongoose";
import { SYS_GEND, SYS_ROLE } from "../../../common/index.js";

const schema=new Schema({
    userName:{
        type:String,
        required:true,
        minLength:2,
        maxLength:30,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    provider:{
        type:String,
        enum:['google','string']
    },
    password:{
        type:String,
        required: function(){
           if(this.provider=='google'){
            return false
           }else{
            return true
           }
        }
    },
    gender:{
        type:Number,
        enum:Object.values(SYS_GEND),
        default:SYS_GEND.male
    },
    role:{
        type:Number,
        enum:Object.values(SYS_ROLE),
        default:SYS_ROLE.user
    },
    phoneNumber:{
        type:String,
        required:function(){
            if(this.email){
                return false
            }else{
                return true
            }
        }
    },
    profilePicture:String,
    isEmailVerified:{
        type:Boolean,
        default:true
    },
    credentialsUpdatedAt:{
        type:Date,
        default:Date.now()
    }
},{
    timestamps:true
})
export const User=new model("User",schema);