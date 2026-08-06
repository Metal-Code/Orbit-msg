import mongoose from "mongoose";
import { required } from "zod/mini";

const ConversationSchema = new mongoose.Schema(
    {
        participantOneId : {
            type : String,
            required : true,
        },
        participantTwoId : {
            type : String,
            required : true,
        },
        participantIds : {
            type : [String],
            required : true,
            validate : v => v.length === 2,
        },
        lastMessageAt : {
            type : Date,
            default : Date.now,
        },
        lastPreview : {
            type : String,
        },
    },
    {timestamps : true}
);

ConversationSchema.index(
    {
        participantOneId : 1,
        participantTwoId : 1,
    },
    { unique : true }
);

ConversationSchema.index({
    participantIds : 1
})

export default mongoose.model("Conversation", ConversationSchema);