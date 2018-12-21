'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  countryName: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  validationToken: { //will generate automatically while resetting password
    type: String,
    default: ''
  },
  emailVerified: {
    type: Boolean,
    default: false
  },

  friends: {
    type: [{
      friendId: {
        type: String,
        default: ''
      },

      friendName: {
        type: String,
        default: ''
      },

    }],
  },

  friendRequestRecieved: {
    type: [{
      friendId: {
        type: String,
        default: ''
      },

      friendName: {
        type: String,
        default: ''
      },

    }],
  },

  friendRequestSent: {
    type: [{
      friendId: {
        type: String,
        default: ''
      },

      friendName: {
        type: String,
        default: ''
      },

    }],
  },

  createdOn: {
    type: Date,
    default: ""
  }


})


mongoose.model('User', userSchema);