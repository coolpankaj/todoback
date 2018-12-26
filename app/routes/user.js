const express = require('express');
//const router = express.Router();
const appConfig = require('./../../config/appConfig');
const userController = require('./../controllers/userController');
const auth = require = require('./../middlewares/auth');


module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}/users`;

    // params: firstName, lastName, email, password , mobileNumber
    app.post(`${baseUrl}/signup`, userController.signUpFunction)

      // params: email, password
    app.post(`${baseUrl}/login`, userController.loginFunction)

    // params: authToken, userId
    app.post(`${baseUrl}/:userId/logout`, auth.isAuthorized, userController.logout)

    // body params: email.
    // generate reset password link only
    app.post(`${baseUrl}/reset-link`, userController.resetEmailFunction)
    
    // params: validationToken,password.
    app.post(`${baseUrl}/update-password`, userController.updatePasswordFunction)

    // body params: userId, oldPassword,newPassword.
    // this is simple change password witout email ,when does this execute?
    // after user login , if he want to change password
    app.post(`${baseUrl}/changePassword`, auth.isAuthorized,userController.changePasswordFunction)

    // params: userId.
    app.put(`${baseUrl}/:userId/edit`, auth.isAuthorized, userController.editUser)

    // params: userId.
    app.get(`${baseUrl}/verify-email/:userId`, userController.verifyEmailFunction)

    // params: userId.
    app.post(`${baseUrl}/:userId/delete`, auth.isAuthorized, userController.deleteUser)

    // no params required
    app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser)

    // params: userId.
    app.get(`${baseUrl}/:userId/details`, auth.isAuthorized,userController.getSingleUser);
}


/** Run this command : apidoc -i app/routes/ -o apidoc/ */