const express = require('express');
const router = express.Router();
const listController = require("../controllers/listController");
const appConfig = require("../../config/appConfig")
const auth = require('../middlewares/auth')


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/lists`;

    // params: listName,listCreatorId,listCreatorName,listModifierId,listModifierName,listMode    
    app.post(`${baseUrl}/addList`, auth.isAuthorized, listController.addListFunction);


    app.put(`${baseUrl}/:listId/updateList`, auth.isAuthorized, listController.updateListFunction)


    app.post(`${baseUrl}/:listId/delete`, auth.isAuthorized, listController.deleteListFunction)


    app.get(`${baseUrl}/view/all/lists/:userId`, auth.isAuthorized, listController.getAllListsFunction)
  

    app.post(`${baseUrl}/view/all/shared/lists`, auth.isAuthorized, listController.getAllPublicListsFunction)
  
    // params: ListId.
    app.get(`${baseUrl}/:listId/details`, auth.isAuthorized, listController.getListDetailsFunction)
   
}


/** Run this command : apidoc -i app/routes/ -o apidoc/ */
