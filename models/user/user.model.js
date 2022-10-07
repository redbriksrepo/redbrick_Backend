const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userModel = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
    },
    mobileNo: {
      type: Number,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    aadharNo: {
      type: Number,
      required: true
    },
    panNo: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    desktopId: {
      type: String,
    },
    mobileId: {
      type: String,
    },
    userActive: {
      type: Boolean,
      default: false,
    },
    activeDevice: {
      type: String,
      default: "None",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userModel);

module.exports = User;
