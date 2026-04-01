const Petition = require("../models/Petition");

exports.getReports = async(req,res)=>{

try{

const totalPetitions = await Petition.countDocuments();

const active = await Petition.countDocuments({status:"active"});
const review = await Petition.countDocuments({status:"under_review"});
const closed = await Petition.countDocuments({status:"closed"});

const totalSignatures = await Petition.aggregate([
{$project:{count:{$size:"$signatures"}}},
{$group:{_id:null,total:{$sum:"$count"}}}
]);

res.json({
totalPetitions,
active,
underReview:review,
closed,
signatures:totalSignatures[0]?.total || 0
});

}catch(error){
res.status(500).json({message:"Error generating report"});
}

};