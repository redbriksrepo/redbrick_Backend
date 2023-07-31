const mongoose = require("mongoose")
const Proposal = require('../../../models/proposal/proposal.model')
const Location= require('../../../models/location/location.model');
const selectionData = require("../../../models/selectionData/selectionData.modal");
const JsonData = require("../../../models/jsonData/jsonData.model");
const deleteProposal = (req, res, next) => {
    let id = req.params.Id;

    if(!id){
        console.log('Id is not valid',id)
    }else{

        console.log('=======',id,'========')
   Proposal.find({_id:id}).then((proposaldata)=>{
    // console.log(proposaldata)
   
    Location.findOne({ location: proposaldata[0].location, center: proposaldata[0].center, floor: proposaldata[0].floor }).then(locationdata => {
        // console.log(locationdata)
        selectionData.findOne({ _id:proposaldata[0].selectionData}).then(selection => {
            console.log(selection,"<><<><<><><><><><>",locationdata.jsonData[0])

            JsonData.updateOne({ _id: locationdata.jsonData[0] }, {
                  $push:{'workstations':selection},  
            }).then(result=>{
                console.log("Successfullyy added in the jsonn data")
            })
            selectionData.findOneAndDelete({ _id:proposaldata[0].selectionData}).then(deletedSelectionData => {
                if (deletedSelectionData) {
                  console.log("SelectionData deleted successfully.");
                } else {
                  console.log("SelectionData not found.");
                }
              })
              .catch(error => {
                console.error("Error occurred while deleting the SelectionData:", error);
              });
          }).catch(error => {
            console.error("Error occurred while deleting the SelectionData:", error);
          });
     console.log(locationdata.proposals)
      const indexToDelete = locationdata.proposals.findIndex(proposal => proposal.proposalId === id);
  
      if (indexToDelete !== -1) {
  
        locationdata.proposals.splice(indexToDelete, 1);
        locationdata.selectedNoOfSeats=locationdata.selectedNoOfSeats-proposaldata[0].totalNumberOfSeats
        locationdata.save().then(updatedLocationData => {
          console.log("Proposal from location deleted successfully.");
        //   res.status(200).json(updatedLocationData);
        }).catch(error => {
          console.error("Error occurred while saving the updated document:", error);
          res.status(500).json({ error: "An error occurred while saving the updated document." });
        });
      } else {
        console.log("Proposal not found.");
        res.status(404).json({ message: "Proposal not found." });
      }
    })
    .catch(error => {
      console.error("Error occurred while finding the location data:", error);
      res.status(500).json({ error: "An error occurred while finding the location data." });
    });
    Proposal.findByIdAndDelete(id).then((result) => {
        if (!result) {
            let error = new Error('No Proposal Found with the Id Provided');
            error.status = 404;
            throw error;
        }
        else {
            res.status(202).send({
                "Message": "Proposal Deleted Successfully!"
            })
        }
    }).catch((err) => {
        if (!err.message) err.message = 'Something went wrong while deleting Proposal';
        if (!err.status) err.status = 400;
        next(err);
    })
   })

  
}
}

module.exports = deleteProposal;