const User = require("../model/UserModel");

exports.getProfile=async(req,res)=>{

    try{

        const userId=req.user.id;
        const user=await User.findByPk(userId,{
            attributes:["id", "name", "email", "careerGoal", "phone", "linkedin"]
        });

        if(!user){
             return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user)

    }
    catch(err){
        console.error(err)
        res.status(500).json({message:"Error fetching profile"})
    }

}
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // comes from JWT
    const { name, careerGoal, phone, linkedin } = req.body;

    // update user
    const [updated] = await User.update(
      { name, careerGoal, phone, linkedin },
      { where: { id: userId } }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    // fetch updated user to return clean data
    const updatedUser = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "careerGoal", "phone", "linkedin"],
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};
