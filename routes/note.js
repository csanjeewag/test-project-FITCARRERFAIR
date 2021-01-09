var express = require('express');
var router = express.Router();
var NOTE = require('../models/note');
var AUTH = require('../auth/index');
var FILEARCHIVE = require("../utils/file_archive");
var FILESYSTEM = require("../utils/fs");
var CONST = require("./../connstants/noteConstants");



/**
 * @api {post} /api/v1/note/add info 2.add notes info
 * @apiVersion 3.0.0
 * @apiName note add info
 * @apiGroup note
 * @apiDescription add basic note informations.
 * @apiPermission true
 * 
 * @apiParam no
 * 
 * @apiSuccessExample {json} Success-Response:   
 *     {
 *        "status": "success",
 *        "data" : data
 *     }
 *
 * @apiError error adding not complete 
 * 
 * @apiErrorExample Error-Response:
 *     Error 400 Bad Request
 *     {
 *       "error": "error",
 *       "message": " adding not complete"
 *     }
 */
router.post('/add', function (req, res, next) {

    const body = req.body;

    let fileName = "";
    if (req.body.text) {
        fileName = FILESYSTEM.fileSave(req.body.text);

        if (body.isArchive ? body.isArchive == true || body.isArchive.toLowerCase() == "true":false) {
            FILEARCHIVE.fileArchive(fileName);
            fileName += '.zip';
        }
    }
    

    const note = new NOTE({
        userId: body.userId,
        titile: body.titile,
        fileName: fileName,
        isArchive: body.isArchive?body.isArchive:false,
       
    });

    note.save(function (err, result) {
        if (err) return res.status(500).json({ err: err });

        if (result) {
            return res.status(200).json({ status: CONST.STATUS_MSG.SUCCUSS, message: CONST.SUCCESS_MSG.ADD_MSG });
        } else {
            return res.status(400).json({ error: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.ADD_MSG });
        }
    });
});




/**
 * @api {get} /api/v1/note/archive/:id get archive note by user id
 * @apiVersion 1.0.0
 * @apiName archive notes
 * @apiGroup User 
 * @apiDescription archive notes by user id
 * @apiPermission true
 * 
 * @apiParam {id} userId is required
 * 
 * @apiSuccessExample {json} Success-Response:   
 *     {
 *        "status": "success",
 *        "data" : data
 *     }
 *
 * @apiError NotFound `Id` is required 
 * 
 * @apiErrorExample Error-Response:
 *     Error 400 Bad Request
 *     {
 *       "error": "NotFound",
 *       "message": "`note id is invalid"
 *     }
 */
router.get('/archive/:id', function (req, res, next) {

    var findUserQuery = { userId: req.params.id , isArchive:true };

    NOTE.find(findUserQuery).then(result => {

        if (result) {
            return res.status(200).json({ status: CONST.STATUS_MSG.SUCCUSS , message: CONST.SUCCESS_MSG.ARCHIVE_MSG, data: result });
        } else {
            return res.status(400).json({ error: CONST.STATUS_MSG.NOTFOUND, message: CONST.ERROR_MSG.ARCHIVE_MSG });
        }
    })
});


/**
 * @api {get} /api/v1/note/unarchive/:id get unarchive note by user id
 * @apiVersion 1.0.0
 * @apiName unarchive notes
 * @apiGroup User 
 * @apiDescription unarchive notes by user id
 * @apiPermission true
 * 
 * @apiParam {id} userId is required
 * 
 * @apiSuccessExample {json} Success-Response:   
 *     {
 *        "status": "success",
 *        "data" : data
 *     }
 *
 * @apiError NotFound `Id` is required 
 * 
 * @apiErrorExample Error-Response:
 *     Error 400 Bad Request
 *     {
 *       "error": "NotFound",
 *       "message": "`note id is invalid"
 *     }
 */
router.get('/unArchive/:id', function (req, res, next) {

    var findUserQuery = { userId: req.params.id , isArchive:false };

    NOTE.find(findUserQuery).then(result => {

        if (result) {
            return res.status(200).json({ status: CONST.STATUS_MSG.SUCCUSS, message: CONST.SUCCESS_MSG.UNARCHIVE_MSG , data: result });
        } else {
            return res.status(400).json({ error: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.UNARCHIVE_MSG });
        }
    })
});



/**
 * @api {get} /api/v1/note/:id get info note by note id
 * @apiVersion 1.0.0
 * @apiName note info
 * @apiGroup User 
 * @apiDescription note info by note id
 * @apiPermission true
 * 
 * @apiParam {id} note is required
 * 
 * @apiSuccessExample {json} Success-Response:   
 *     {
 *        "status": "success",
 *        "data" : data
 *     }
 *
 * @apiError UserNotFound `Id` is required 
 * 
 * @apiErrorExample Error-Response:
 *     Error 400 Bad Request
 *     {
 *       "error": "NotFound",
 *       "message": "`note id is invalid"
 *     }
 */
router.get('/:id', function (req, res, next) {

        
    NOTE.findById(req.params.id).then(result => {

        if (result && (!result.isArchive)) {

            const read_detail = FILESYSTEM.readfile(result.fileName);
        
            return res.status(200).json({ status: CONST.STATUS_MSG.SUCCUSS,text: read_detail, data:result});
           
            
        } else {
            
            return res.status(400).json({ error: CONST.STATUS_MSG.ERROR , message: CONST.ERROR_MSG.GET_MSG });
        }
    })
});




/**
 * @api {delete} /api/v1/note/delete/:id delete by note id
 * @apiVersion 1.0.0
 * @apiName delete notes
 * @apiGroup User 
 * @apiDescription delete note by id
 * @apiPermission true
 * 
 * @apiParam {id} note id is required
 * 
 * @apiSuccessExample {json} Success-Response:   
 *     {
 *        "status": "success",
 *        "data" : data
 *     }
 *
 * @apiError UserNotFound `Id` is required 
 * 
 * @apiErrorExample Error-Response:
 *     Error 400 Bad Request
 *     {
 *       "error": "NotFound",
 *       "message": "deletaion not complete"
 *     }
 */
router.delete('/delete/:id', function (req, res, next) {

   
    NOTE.findByIdAndDelete(req.params.id)
        .then((del_item) => {

            FILESYSTEM.remove_file(del_item.fileName);

            return res.status(200).json({ status: CONST.STATUS_MSG.SUCCUSS, message: CONST.SUCCESS_MSG.DELETE_MSG  });
        })
        .catch((err) => {
            return res.status(400).json({ error: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.DELETE_MSG });
        })


});




/**
 * @api {put} /api/v1/note/toarchive/:id to convert to archive
 * @apiVersion 1.0.0
 * @apiName to archive notes
 * @apiGroup User 
 * @apiDescription convert to archive note by id
 * @apiPermission true
 * 
 * @apiParam {id} note id is required
 * 
 * @apiSuccessExample {json} Success-Response:   
 *     {
 *        "status": "success",
 *        "data" : data
 *     }
 *
 * @apiError UserNotFound `Id` is required 
 * 
 * @apiErrorExample Error-Response:
 *     Error 400 Bad Request
 *     {
 *       "error": "NotFound",
 *       "message": "convert is not complete"
 *     }
 */
router.put('/toArchive/:id', function (req, res, next) {



    NOTE.findById(req.params.id)
    .then((pre)=>{
        if(pre.isArchive){
            return res.status(400).json({ status: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.TO_ARCHIVE_MSG});
        }
        else{
            let updateObject ={};
            FILEARCHIVE.fileArchive(pre.fileName);
            updateObject['isArchive'] = true;
            updateObject['fileName'] = pre.fileName+'.zip';

            NOTE.findByIdAndUpdate(req.params.id, updateObject)
            .then((result) => {
    
                return res.status(200).json({ status: CONST.STATUS_MSG.SUCCUSS, message: CONST.SUCCESS_MSG.TO_ARCHIVE_MSG });
            }).catch(err => {
                return res.status(400).json({ status: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.TO_ARCHIVE_MSG});
    
            })

        }
    })

});



/**
 * @api {put} /api/v1/note/tounarchive/:id to convert to unarchive
 * @apiVersion 1.0.0
 * @apiName to unarchive notes
 * @apiGroup User 
 * @apiDescription convert to unarchive note by id
 * @apiPermission true
 * 
 * @apiParam {id} note id is required
 * 
 * @apiSuccessExample {json} Success-Response:   
 *     {
 *        "status": "success",
 *        "data" : data
 *     }
 *
 * @apiError UserNotFound `Id` is required 
 * 
 * @apiErrorExample Error-Response:
 *     Error 400 Bad Request
 *     {
 *       "error": "NotFound",
 *       "message": "convert is not complete"
 *     }
 */
router.put('/tounArchive/:id', function (req, res, next) {



    NOTE.findById(req.params.id)
    .then((pre)=>{
        if(!pre.isArchive){
            return res.status(400).json({ status: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.TO_UNARCHIVE_MSG });
        }
        else{
            let updateObject ={};
            FILEARCHIVE.unfileArchive(pre.fileName);
            updateObject['isArchive'] = false;
            updateObject['fileName'] = pre.fileName.slice(0,-4);

            NOTE.findByIdAndUpdate(req.params.id, updateObject)
            .then((result) => {
    
                return res.status(200).json({ status: CONST.STATUS_MSG.SUCCUSS, message: CONST.SUCCESS_MSG.TO_UNARCHIVE_MSG });
            }).catch(err => {
                return res.status(400).json({ status: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.TO_UNARCHIVE_MSG });
    
            })

        }
    })

});



/**
 * @api {put} /api/v1/note/update/:id update by note id
 * @apiVersion 1.0.0
 * @apiName update notes
 * @apiGroup User 
 * @apiDescription update note by id only unarchive
 * @apiPermission true
 * 
 * @apiParam {id} note id is required
 * 
 * @apiSuccessExample {json} Success-Response:   
 *     {
 *        "status": "success",
 *        "data" : data
 *     }
 *
 * @apiError UserNotFound `Id` is required 
 * 
 * @apiErrorExample Error-Response:
 *     Error 400 Bad Request
 *     {
 *       "error": "NotFound",
 *       "message": "update is not complete"
 *     }
 */
router.put('/update/:id', function (req, res, next) {

    const body = req.body;

    NOTE.findById(req.params.id)
    .then((pre)=>{
        if(pre.isArchive){
            return res.status(400).json({ status: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.UPDATE_MSG_2  });
        }
        else{

            let updateObject = {};
            if (body.titile) updateObject['titile'] = body.titile;


            if (body.text) {
                FILESYSTEM.updateSave(req.body.text,pre.fileName);              
             }

         
            if (body.isArchive) {
                if (body.isArchive == true || body.isArchive.toLowerCase() == "true") {

                    FILEARCHIVE.fileArchive(pre.fileName);
                    updateObject['isArchive'] = true;
    
                    updateObject['fileName'] += '.zip';

                } else if (body.isArchive == false || body.isArchive.toLowerCase() == "false") {
            
                    updateObject['isArchive'] = false;
                }
            }   


            NOTE.findByIdAndUpdate(req.params.id, updateObject)
            .then((result) => {
    
                return res.status(200).json({ status: CONST.STATUS_MSG.SUCCUSS, message: CONST.SUCCESS_MSG.UPDATE_MSG  });
            }).catch(err => {
                return res.status(400).json({ status: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.UPDATE_MSG });
    
            })

        }
    })
    .catch((eror)=>{
        return res.status(400).json({ error: CONST.STATUS_MSG.ERROR, message: CONST.ERROR_MSG.UPDATE_MSG });
    })

});




module.exports = router;