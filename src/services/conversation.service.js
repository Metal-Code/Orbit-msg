import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import Conversation from "../models/conversation.model.js"

export const findOrCreateConversation = async (userIdA, userIdB) => {
    if(userIdA === userIdB)
        throw new ApiError(400, `Cannot start a conversation with yourself`)

    const [participantOneId, participantTwoId] = [userIdA, userIdB].sort()

    let conversation = await Conversation.findOne({participantOneId, participantTwoId});

    if(!conversation)
    {
        conversation = await Conversation.create({
            participantOneId,
            participantTwoId,
            participantIds : [participantOneId, participantTwoId]
        })
    }
    return conversation
};