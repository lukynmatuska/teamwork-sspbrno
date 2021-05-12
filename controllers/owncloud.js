/**
 * OwnCloud controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const oc = require('../libs/owncloud')

/** 
 * Models
*/
const TeamWork = require('../models/TeamWork')
const User = require('../models/User')

function getPath(teamwork) {
    return `${global.CONFIG.owncloud.folder}${teamwork._id}`
}

module.exports.newTeamwork = (req, res, teamwork) => {
    function resolveProblemWithSharingFolderToUser(response, errorDetail) {
        if (response === 'ok') {
            return;
        } else if (response === 'error') {
            console.error(errorDetail);
        }
    }
    let path = getPath(teamwork)
    oc.files.mkdir(path).then(() => {
        oc.shares.shareFileWithLink(path, { perms: 0 }).then(async (linkShareInfo) => {
            for (let i = 0; i < teamwork.guarantors.length; i++) {
                if (teamwork.guarantors[i].user != undefined) {
                    if (teamwork.guarantors[i].user.ownCloudId != undefined) {
                        await this.shareTeamworkFolderToUser(null, null, teamwork, teamwork.guarantors[i].user.ownCloudId, 31, 'guarantor', null, null, resolveProblemWithSharingFolderToUser)
                    }
                }
            }
            for (let i = 0; i < teamwork.consultants.length; i++) {
                if (teamwork.consultants[i].user != undefined) {
                    if (teamwork.consultants[i].user.ownCloudId != undefined) {
                        await this.shareTeamworkFolderToUser(null, null, teamwork, teamwork.consultants[i].user.ownCloudId, 31, 'consultants', null, null, resolveProblemWithSharingFolderToUser)
                    }
                }
            }
            for (const student of teamwork.students) {
                if (student.user != undefined) {
                    if (student.user.ownCloudId != undefined) {
                        await this.shareTeamworkFolderToUser(null, null, teamwork, student.user.ownCloudId, 15, 'student', null, null, resolveProblemWithSharingFolderToUser)
                    }
                }
            }
            TeamWork
                .findByIdAndUpdate(
                    teamwork._id,
                    {
                        owncloud: {
                            link: linkShareInfo.getLink()
                        }
                    }
                )
                .exec((err, tw) => {
                    if (err) {
                        console.error(err)
                        return res
                            .status(500)
                            .json({
                                status: 'error',
                                error: err
                            })
                    }
                    return res
                        .status(200)
                        .json({
                            status: 'ok',
                            teamwork: tw,
                        })
                })
        }).catch(error => {
            console.error(error)
            return res
                .status(500)
                .json({
                    status: 'error',
                    error
                })
        })
    }).catch(error => {
        console.error(error)
        return res
            .status(500)
            .json({
                status: 'error',
                error
            })
    })
}

module.exports.selectTeamWork = (req, res, teamWork) => {
    function mongo(req, res, teamWorkUpdate) {
        TeamWork
            .findByIdAndUpdate(req.body.id, teamWorkUpdate)
            .exec((err) => {
                if (err) {
                    console.error(err)
                    return res
                        .status(500)
                        .json({
                            status: 'error',
                            error: 'mongo-err'
                        })
                }
                return res
                    .status(200)
                    .json({
                        status: 'ok'
                    })
            })
    }
    if (req.session.user.ownCloudId != undefined) {
        oc.shares.shareFileWithUser(
            getPath(teamWork),
            req.session.user.ownCloudId,
            { perms: 15 }
        ).then((shareInfo) => {
            students = teamWork.owncloud.shares.students
            students.push(shareInfo.shareInfo.id)
            mongo(req, res, {
                owncloud: {
                    shares: {
                        students
                    }
                }
            })
        }).catch((err) => {
            if (err == 'Path already shared with this user') {
                return mongo(req, res, teamWork)
            }
            console.error(err)
            return res
                .status(500)
                .json({
                    status: 'error',
                    error: 'owncloud-err'
                })
        })
    } else {
        mongo(req, res, teamWork)
    }
}

module.exports.deleteTeamWork = (req, res, teamWork) => {
    oc.files.delete(getPath(teamWork)).then((shareInfo) => {
        return res
            .json({
                status: 'ok'
            })
    }).catch(error => {
        console.error(error)
        return res
            .status(500)
            .json({
                status: 'error',
                error: `Týmová práce byla smazána, ale Owncloud hlásí problém: ${error}`
            })
    })
}

module.exports.leaveTeamWork = (req, res, teamWork) => {
    /**
     * Better removing items from array
     */
    Array.prototype.remove = function () {
        var what, a = arguments, L = a.length, ax
        while (L && this.length) {
            what = a[--L]
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this
    }

    // Create arrays with OwnCloud IDs of students
    const studentsOwnCloudIds = []
    for (const student of teamWork.students) {
        if (student.user != undefined) {
            if (student.user.ownCloudId != undefined) {
                studentsOwnCloudIds.push(student.user.ownCloudId)
            }
        }
    }
    let studentsOwnCloudIdsToShare = [...studentsOwnCloudIds]

    // Create array for promises
    const getSharePromises = []
    for (const shareId of teamWork.owncloud.shares.students) {
        if (shareId != undefined) {
            getSharePromises.push(oc.shares.getShare(shareId))
        }
    }

    // Solve promises
    Promise.all(getSharePromises).then(shares => {
        // Create arrays for share IDs
        const studentsShares = []
        for (const share of shares) {
            if (studentsOwnCloudIds.includes(share.shareInfo.share_with)) {
                studentsOwnCloudIdsToShare.remove(share.shareInfo.share_with)
                studentsShares.push(share.shareInfo.id)
            } else {
                oc.shares.deleteShare(share.shareInfo.id).then(function () { }).catch(console.error)
            }
        }
        const studentsPromises = []
        for (const studentOwnCloudId of studentsOwnCloudIdsToShare) {
            studentsPromises.push(oc.shares.shareFileWithUser(getPath(teamWork), studentOwnCloudId, { perms: 15 }))
        }
        Promise.all(studentsPromises).then((values) => {
            for (const value of values) {
                studentsShares.push(value.shareInfo.id)
            }
            TeamWork
                .findByIdAndUpdate(
                    teamWork._id,
                    {
                        owncloud: {
                            shares: {
                                students: studentsShares,
                            }
                        }
                    }, { new: true }
                )
                .exec((err, tw) => {
                    if (err) {
                        console.error(err)
                        return res
                            .status(500)
                            .json({
                                status: 'error',
                                error: err
                            })
                    }
                    return res
                        .status(200)
                        .json({
                            status: 'ok'
                        })
                })
        }).catch((error) => {
            console.error(error)
            return res
                .status(500)
                .json({
                    status: 'error',
                    error
                })
        })
    }).catch(error => {
        console.error(error)
        return res
            .status(500)
            .json({
                status: 'error',
                error
            })
    })
}

module.exports.shareTeamworkFolderToUser = (req, res, teamwork, userOwnCloudId, perms = 1, userType, positionId, previousShareId, callback) => {
    if (previousShareId != undefined) {
        oc.shares.deleteShare(previousShareId).then(() => { }).catch(console.error)
    }
    return oc.shares
        .shareFileWithUser(getPath(teamwork), userOwnCloudId, { perms })
        .then(shareInfo => {
            let update = {};
            if (userType == 'student') {
                update.students = [];
                for (let i = 0; i < teamwork.students.length; i++) {
                    update.students.push(teamwork.students[i]);
                    if (String(teamwork.students[i]._id) != String(positionId)) {
                        continue;
                    }
                    update.students[i].owncloudShareId = String(shareInfo.shareInfo.id);
                    break;
                }
            } else if (userType == 'consultant') {
                update.consultants = [];
                for (let i = 0; i < teamwork.consultants.length; i++) {
                    update.consultants.push(teamwork.consultants[i]);
                    if (String(teamwork.consultants[i]._id) != String(positionId)) {
                        continue;
                    }
                    update.consultants[i].owncloudShareId = String(shareInfo.shareInfo.id);
                    break;
                }
            } else if (userType == 'guarantor') {
                update.guarantors = [];
                for (let i = 0; i < teamwork.guarantors.length; i++) {
                    update.guarantors.push(teamwork.guarantors[i]);
                    if (String(teamwork.guarantors[i]._id) != String(positionId)) {
                        continue;
                    }
                    update.guarantors[i].owncloudShareId = String(shareInfo.shareInfo.id);
                    break;
                }
            }
            TeamWork
                .findByIdAndUpdate(
                    req.body.twid,
                    update
                )
                .exec((err) => {
                    if (err) {
                        console.error(err)
                        if (callback != undefined) {
                            return callback('error', err)
                        }
                        return res
                            .status(500)
                            .json({
                                status: 'error',
                                error: err
                            })
                    }
                    if (callback != undefined) {
                        return callback('ok')
                    }
                    return res
                        .status(200)
                        .json({
                            status: 'ok'
                        })
                })
        })
        .catch(error => {
            console.error(error)
            if (callback != undefined) {
                return callback('error', error)
            }
            return res
                .status(500)
                .json({
                    status: 'error',
                    error: error
                })
        })
}

module.exports.deleteShare = (req, res, owncloudShareId) => {
    oc.shares.deleteShare(owncloudShareId)
        .then((info) => {
            return res
                .status(200)
                .json({
                    status: 'ok'
                })
        })
        .catch((err) => {
            console.error(err);
            return res
                .status(500)
                .json({
                    status: 'error',
                    error: err
                })
        });
}