﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/user/:_user', findUser);
router.get('/current', getCurrentUser);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);

module.exports = router;

function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                // authentification successful
                res.send({ token: token });
            } else {
                // authentification failed
                res.sendStatus(401);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function findUser(req, res) {
    userService.getByUsername(req.params._user)
        .then(function (user) {
			if(user){
				res.send(user);
			}else{
				res.sendStatus(404);
			}
            
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var userId = req.params._id;
    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}