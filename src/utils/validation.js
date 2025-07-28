const validateEditProfileData =(req)=>{

  const allowedData=["firstName","lastName","password","age","photoURL","mobileNumber","about","gender","education","booksForLend"]; 
  const isAllowed=Object.keys(req.body).every(feild=>allowedData.includes(feild));
  return isAllowed;
}
module.exports={validateEditProfileData};