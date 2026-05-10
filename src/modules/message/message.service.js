import { NotFoundException, SYS_MESSAGE } from "../../common/index.js";
import { messageRepository } from "../../DB/models/message/message.repository.js"

export const sendMessage = async (content, files, receiverId, senderId = undefined) => {
    let paths = []
    if (files) {
        console.log(files);
        paths = files.map((file) => {
            return file.path
        })
    }
    const createdMessage = await messageRepository.create({
        content,
        receiver: receiverId,
        attachments: paths,
        sender: senderId
    });
    return createdMessage;
}

export const getSpecificMessage = async (id, userId) => {
    const messages = await messageRepository.getOne(
        { _id: id, $or: [{ sender: userId }, { receiver: userId }] }
        , {}
        , {
            populate: [
                {
                    path: "receiver"
                    , select: "userName email"
                }
                , {
                    path: "sender"
                    , select: "userName email"
                }
            ]
        });
    if (!messages) {
        throw new NotFoundException(SYS_MESSAGE.message.notFound);
    } else {
        return messages;
    }
}

export const getAllMessages = async (userID) => {
    const messages = await messageRepository.getAll({
        $or: [{ sender: userID }, { receiver: userID }]
    },
        {},
        {
            populate: [
                {
                    path: "receiver",
                    select: "userName email"
                },
                {
                    path: "sender",
                    select: "userName email"
                }]
        });
    if(messages.length==0){
        throw new NotFoundException("you don't have messages yet");
    }else{
        return messages;
    }    
}