import { NotFoundException, SYS_MESSAGE } from "../../common/index.js";
import { userRepository } from "../../DB/index.js"
import fs from 'node:fs';

export const checkUserExist=async(filter)=>{
   return await userRepository.getOne(filter)
}

export const createUser=async(userData)=>{
   return await userRepository.create(userData);
}

export const getProfile=async(filter)=>{
   return await userRepository.getOne(filter);
}

export const uploadProfilePicture=async(user,file)=>{
  const userUpdated= await userRepository.update({_id:user._id},{profilePicture:file.path});
  if(!userUpdated){
   throw new NotFoundException(SYS_MESSAGE.user.notFound);
}
if(fs.existsSync(user.profilePicture)){
   fs.unlinkSync(user.profilePicture); 
}
  return userUpdated;
}
