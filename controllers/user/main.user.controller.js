const createUser = require('./create/create.user.controller');
const updateUser = require('./update/update.user.controller');
const deleteUser = require('./delete/delete.user.controller');
const getByIdUser = require('./getById/getById.user.controller');
const getAllUser = require('./getAll/getAll.user.controller');
const getSalesHead = require('./salesHeadList/salesHeadList.user.controller');


const userController = {
    create: createUser,
    update: updateUser,
    delete: deleteUser,
    getById: getByIdUser,
    getAll: getAllUser,
    getSalesHead: getSalesHead
}

module.exports = userController;