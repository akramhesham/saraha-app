const generateMessage=(entity)=>{
    return{
        alreadyExist: `${entity} already exist`,
        notFound: `${entity} not found`,
        created: `${entity} created successfully`,
        updated: `${entity} updated successfully`,
        deleted: `${entity} deleted successfully`,
        failToCreated: `fail to create ${entity}`,
        failToUpdate: `fail to update ${entity}`,
        failToDelete: `fail to delete ${entity}`,
    }
}
export const SYS_MESSAGE={
    user:generateMessage("User"),
    product:generateMessage("Product"),
    category:generateMessage("Category"),
    brand:generateMessage("Brand")
}