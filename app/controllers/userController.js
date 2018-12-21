const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const validateInput = require('./../libs/paramsValidationLib');
const check = require('./../libs/checkLib');
const token = require('./../libs/tokenLib');
const AuthModel = mongoose.model('Auth');
const emailLib = require('./../libs/emailLib');
const UserModel = mongoose.model('User');
const applicationUrl = '';
const appConfig = require('./../../config/appConfig');
const baseUrl = `${appConfig.apiVersion}/users`;


let signUpFunction = (req, res) => {
    console.log(req.body)
    console.log('signup called')
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {

            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email doesnot match requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, 'password is missing', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('field is missing while user creation', 'userController: validateUserInput', 5)
                let apiResponse = response.generate(true, 'one or more parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({
                    email: req.body.email
                })
                .exec((err, retreivedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'fail to create user', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retreivedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            countryName: req.body.countryName,
                            mobileNumber: req.body.mobileNumber,
                            email: req.body.email.toLowerCase(),
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })

                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'failse to create user', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                console.log(`${baseUrl}/verifyEmail/${newUserObj.userId}`)
                                let sendEmailOptions = {
                                    email: newUserObj.email,
                                    name: newUserObj.firstName + ' ' + newUserObj.lastName,
                                    subject: 'Welcome to Todo ',
                                    html: `<b> Dear ${newUserObj.firstName}</b><br>  
                                        <br>Welcome to <b>Todo App</b> <br>
                                        Please click on following link to verify your account with Todo.<br>
                                        <br> <a href="${baseUrl}/verifyEmail/${newUserObj.userId}">Click Here</a>                                     
                                        `
                                }
                                setTimeout(() => {
                                    emailLib.sendEmail(sendEmailOptions);
                                }, 2000);
                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('user already exist', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }


    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
}

let loginFunction = (req, res) => {
        let findUser = () => {
            return new Promise((resolve, reject) => {
                if (req.body.email) {
                    // and: [{ email: req.body.email}, { emailVerified: true}]
                    UserModel.findOne({  email: req.body.email }, (err, userDetails) => {
                            if (err) {
                                logger.error('Failed to fetch user details', 'userController: loginFunction', 10 )
                                let apiResponse = response.generate(true, 'failed to find user details', 500, null)
                                reject(apiResponse)
                            } else if(check.isEmpty(userDetails)) {
                                logger.error('No user found', 'usercontroller: loginFunction', 10)
                                let apiResponse = response.generate(true, 'No user with this email or user email is not verified', 404, null)
                                reject(apiResponse)
                            } else {
                                logger.info('user found', 'usercontroler: loginFunction', 10)
                                resolve(userDetails)
                            }
                    })
                } else {
                    let apiResponse = response.generate(true, 'email parameter is missing', 400, null)
                    reject(apiResponse)
                }
            })
        }


        let validatePassword = (userDetails) => {
            console.log('vaildate password start')
            return new Promise((resolve, reject) => {
                passwordLib.comparePassword(req.body.password,userDetails.password, (err, isMatch) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'userController: validatePassword',10)
                        let apiResponse = response.generate(true, 'Login Failed', 500, null)
                        reject(apiResponse)
                    } else if (isMatch) {
                        let userDetailsObj = userDetails.toObject()
                        delete userDetailsObj.password
                        // delete userDetailsObj.userId
                        delete userDetailsObj.__v
                        delete userDetailsObj.createdOn
                        delete userDetailsObj.modifiedOn
                        delete userDetailsObj._id
                        resolve(userDetailsObj)
                    } else {
                        logger.info('Invalid Password', 'userController: validatePassword', 10)
                        let apiResponse = response.generate(true, 'Invalid Password', 400, null)
                        reject(apiResponse)
                    }
                })
            })
        }


        let generateToken = (userDetails) => {
                console.log('generating Token')
                return new Promise ((resolve, reject) => {
                    token.generateToken(userDetails, (err, tokenDetails) => {
                        if (err) {
                            console.log(err)
                            let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                            reject(apiResponse)
                        } else {
                            tokenDetails.userId = userDetails.userId
                            tokenDetails.userDetails = userDetails
                            resolve(tokenDetails)
                        }
                    })
                })
        }

        let saveToken = (tokenDetails) => {
            console.log("save token");
            //console.log(tokenDetails)
            return new Promise((resolve, reject) => {
                AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                    if (err) {
                        console.log(err.message, 'userController: saveToken', 10)
                        let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedTokenDetails)) {
                        let newAuthToken = new AuthModel({
                            userId: tokenDetails.userId,
                            authToken: tokenDetails.token,
                            tokenSecret: tokenDetails.tokenSecret,
                            tokenGenerationTime: time.now()
                        })
                        newAuthToken.save((err, newTokenDetails) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: saveToken', 10)
                                let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                                reject(apiResponse)
                            } else {
                                let responseBody = {
                                    authToken: newTokenDetails.authToken,
                                    userDetails: tokenDetails.userDetails
                                }
                                resolve(responseBody)
                            }
                        })
                    } else {
                        retrievedTokenDetails.authToken = tokenDetails.token
                        retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                        retrievedTokenDetails.tokenGenerationTime = time.now()
                        retrievedTokenDetails.save((err, newTokenDetails) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: saveToken', 10)
                                let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                                reject(apiResponse)
                            } else {
                                let responseBody = {
                                    authToken: newTokenDetails.authToken,
                                    userDetails: tokenDetails.userDetails
                                }
                                resolve(responseBody)
                            }
                        })
                    }
                })
            })
        }


        findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

    }



    let logout = (req, res) => {
        AuthModel.findOneAndDelete({ userId: req.params.userId }, (err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'user Controller: logout', 10)
                let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
                res.send(apiResponse)
            }
        })
    }


      
let resetPasswordFunction = (req, res) => {
    //finding user with email
    let findUser = () => {
        console.log("findUser start");
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        /* generate the error message and the api response message here */
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                        /* if Company Details is not found */
                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: findUserFunction', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: findUserFunction', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, 'email parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    //reset password
    let generateToken = (userDetails) => {
        console.log("generate token to reset password");
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let resetPassword = (tokenDetails) =>{
        return new Promise((resolve, reject) => {

            let options = {
                validationToken: tokenDetails.token
            }
    
            UserModel.update({ email: req.body.email }, options).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'User Controller:resetPasswordFunction', 10)
                    let apiResponse = response.generate(true, 'Failed To reset user Password', 500, null)
                    reject(apiResponse)
                }  else {
    
                    //let apiResponse = response.generate(false, 'Password reset successfully', 200, result)
                    resolve(result)
                    //Creating object for sending welcome email
                    console.log(tokenDetails)
                    let sendEmailOptions = {
                        email: tokenDetails.userDetails.email,
                        subject: 'Reset Password for Todo ',
                        html: `<h4> Hi ${tokenDetails.userDetails.firstName}  ${tokenDetails.userDetails.lastName}</h4>
                            <p>
                                We got a request to reset your password associated with this ${tokenDetails.userDetails.email} . <br>
                                <br>Please use following link to reset your password. <br>
                                <br> <a href="${baseUrl}/updatePassword/${options.validationToken}">Click Here</a>                                 
                            </p>
    
                            <br><b>Todo</b>
                                        `
                    }
    
                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);
    
                }
            });// end user model update
    
        });//end promise
    
    }//end reset password

    //making promise call
    findUser(req, res)
        .then(generateToken)
        .then(resetPassword)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Password reset instructions sent successfully', 200, 'None')
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })


} // end

let updatePasswordFunction = (req, res) => {

    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.params.validationToken) {
                console.log("req body validationToken is there");
                console.log(req.body);
                UserModel.findOne({ validationToken: req.params.validationToken }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        /* generate the error message and the api response message here */
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                        /* if Company Details is not found */
                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"validationToken" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let passwordUpdate = (userDetails) => {
        return new Promise((resolve, reject) => {

            let options = {
                password: passwordLib.hashpassword(req.body.password),
                validationToken:''
            }

            UserModel.update({ userId: userDetails.userId }, options).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'User Controller:updatePasswordFunction', 10)
                    let apiResponse = response.generate(true, 'Failed To reset user Password', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No User Found with given Details', 'User Controller: updatePasswordFunction')
                    let apiResponse = response.generate(true, 'No User Found', 404, null)
                    reject(apiResponse)
                } else {


                    let apiResponse = response.generate(false, 'Password Updated successfully', 200, result)
                    //resolve(result)
                    resolve(apiResponse)
                    //Creating object for sending welcome email

                    let sendEmailOptions = {
                        email: userDetails.email,
                        subject: 'Password Updated for Todo ',
                        html: `<h4> Hi ${userDetails.firstName}  ${userDetails.lastName}</h4>
                        <p>
                            Password updated successfully.
                        </p>
                        <h3> Thanks for using Todo </h3>
                                    `
                    }

                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);


                }
            });// end user model update
        });
    }//end passwordUpdate

    findUser(req, res)
        .then(passwordUpdate)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Password Update Successfully', 200, null)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })


}// end updatePasswordFunction

let changePasswordFunction = (req, res) => {
    //finding user
    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.userId != undefined && req.body.oldPassword != undefined) {
                console.log("req body userId and oldPassword is there");
                console.log(req.body);
                UserModel.findOne({ userId: req.body.userId }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        /* generate the error message and the api response message here */
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                        /* if Company Details is not found */
                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"userId" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    //validate old password with database 
    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword");
        console.log(retrievedUserDetails);
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.oldPassword, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Validate Password Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Update Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    //password update 
    let passwordUpdate = (userDetails) => {
        return new Promise((resolve, reject) => {

            let options = {
                password: passwordLib.hashpassword(req.body.newPassword),
            }

            UserModel.update({ userId: userDetails.userId }, options).exec((err, result) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'User Controller:updatePasswordFunction', 10)
                    let apiResponse = response.generate(true, 'Failed To update user Password', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No User Found with given Details', 'User Controller: updatePasswordFunction')
                    let apiResponse = response.generate(true, 'No User Found', 404, null)
                    reject(apiResponse)
                } else {


                    // let apiResponse = response.generate(false, 'Password Updated successfully', 200, result)
                    resolve(result)
                    //Creating object for sending welcome email

                    let sendEmailOptions = {
                        email: userDetails.email,
                        subject: 'Password Updated for Todo',
                        html: `<h4> Hi ${userDetails.firstName}  ${userDetails.lastName}</h4>
                        <p>
                            Password updated successfully.
                        </p>
                        <h3> Thanks for using Todo </h3>
                                    `
                    }
                    console.log(sendEmailOptions)
                    
                    setTimeout(() => {
                        emailLib.sendEmail(sendEmailOptions);
                    }, 2000);


                }
            });// end user model update
        });
    }//end passwordUpdate

    //making promise call
    findUser(req, res)
        .then(validatePassword)
        .then(passwordUpdate)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Password Updated Successfully', 200, null)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })


}// end changePasswordFunction

let editUser = (req, res) => {

    let options = req.body;
    UserModel.update({ userId: req.params.userId }, options).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller:editUser', 10)
            let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: editUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'User details Updated', 200, "None")
            res.send(apiResponse)
        }
    });// end user model update


}// end edit user

let verifyEmailFunction = (req, res) => {
    let findUser = () => {
        //console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.params.userId) {
                console.log("req body userId is there");
                //console.log(req.body);
                UserModel.findOne({ userId: req.params.userId })
                .select('-password -__v -_id')
                .lean()
                .exec((err, result) => {
                    if (err) {
                        console.log(err)
                        logger.error(err.message, 'User Controller: getSingleUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No User Found', 'User Controller:getSingleUser')
                        let apiResponse = response.generate(true, 'No User Found', 404, null)
                        reject(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'User Details Found', 200, result)
                        resolve(result)
                    }
                })
        
            } else {
                let apiResponse = response.generate(true, 'userId parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let verifyEmail = (retrievedUserDetails) => {
        //console.log("verifyEmail");
        return new Promise((resolve, reject) => {
            UserModel.updateOne({ userId: retrievedUserDetails.userId }, {emailVerified: true}).exec((err, result) => {
                if (err) {
                    //console.log("Error in verifying" + err)
                    logger.error(err.message, 'User Controller:verifyEmail', 10)
                    let apiResponse = response.generate(true, 'Failed To verify email', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.info('No User Found', 'User Controller: verifyEmail')
                    let apiResponse = response.generate(true, 'No User Found', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'User email Verified', 200, result)
                    resolve(result)
                }
            });// end user model update
        })
    }


    findUser(req, res)
        .then(verifyEmail)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'User email Verified', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
}


let deleteUser = (req, res) => {

    UserModel.findOneAndDelete({ userId: req.params.userId }).exec((err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'User Controller: deleteUser', 10)
            let apiResponse = response.generate(true, 'Failed To delete user', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.info('No User Found', 'User Controller: deleteUser')
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Deleted the user successfully', 200, result)
            res.send(apiResponse)
        }
    });// end user model find and remove


}// end delete user


let getAllUser = (req, res) => {
    UserModel.find()
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all users

let getSingleUser = (req, res) => {
    UserModel.findOne({ userId: req.params.userId })
        .select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getSingleUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller:getSingleUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get single user


module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout,
    resetPasswordFunction: resetPasswordFunction,
    updatePasswordFunction: updatePasswordFunction,
    changePasswordFunction: changePasswordFunction,
    editUser: editUser,
    verifyEmailFunction: verifyEmailFunction,
    deleteUser: deleteUser,
    getAllUser: getAllUser,
    getSingleUser: getSingleUser
}