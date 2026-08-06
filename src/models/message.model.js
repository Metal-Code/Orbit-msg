import mongoose from "mongoose";
import { required } from "zod/mini";

const messageSchema = new mongoose.Schema(
    {
        conversationId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Conversation',
            required : true,
            index : true
        },
        senderId : {
            type : String,
            required : true,
        },
        content : {
            type : String,
            required : true
        },
        isRead : {
            type : Boolean,
            default : false
        }
    },
    {timestamps : true}
)

export default mongoose.model('Message', messageSchema);