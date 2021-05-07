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

function getPath(teamwork) {
    return `${global.CONFIG.owncloud.folder}${teamwork._id}`
}

module.exports.newTeamwork = (req, res, teamwork) => {
    let path = getPath(teamwork)
    let guarantorsAndConsultants = new Set()
    for (let i = 0; i < teamwork.guarantors.length; i++) {
        if (teamwork.guarantors[i].user != undefined) {
            if (teamwork.guarantors[i].user.ownCloudId != undefined) {
                guarantorsAndConsultants.add(String(teamwork.guarantors[i].user.ownCloudId))
            }
        }
    }
    for (let i = 0; i < teamwork.consultants.length; i++) {
        if (teamwork.consultants[i].user != undefined) {
            if (teamwork.consultants[i].user.ownCloudId != undefined) {
                guarantorsAndConsultants.add(String(teamwork.consultants[i].user.ownCloudId))
            }
        }
    }
    let students = []
    for (const student of teamwork.students) {
        if (student.user != undefined) {
            if (student.user.ownCloudId != undefined) {
                students.push(student.user.ownCloudId)
            }
        }
    }
    oc.files.mkdir(path).then(() => {
        oc.shares.shareFileWithLink(path, { perms: 0 }).then((linkShareInfo) => {
            const promises = []
            for (let ownCloudId of guarantorsAndConsultants) {
                promises.push(
                    oc.shares.shareFileWithUser(
                        path,
                        ownCloudId,
                        { perms: 31 }
                    )
                )
            }
            Promise.all(promises).then(guarantorsAndConsultantsValues => {
                let guarantorsAndConsultantsShares = []
                for (const value of guarantorsAndConsultantsValues) {
                    guarantorsAndConsultantsShares.push(value.shareInfo.id)
                }

                const studentsPromises = []
                for (const ownCloudId of students) {
                    studentsPromises.push(
                        oc.shares.shareFileWithUser(
                            path,
                            ownCloudId,
                            { perms: 15 }
                        )
                    )
                }
                Promise.all(studentsPromises).then(values => {
                    let studentsShares = []
                    for (const value of values) {
                        studentsShares.push(value.shareInfo.id)
                    }
                    TeamWork
                        .findByIdAndUpdate(
                            teamwork._id,
                            {
                                owncloud: {
                                    link: linkShareInfo.getLink(),
                                    shares: {
                                        students: studentsShares,
                                        consultantsAndGuarants: guarantorsAndConsultantsShares,
                                    }
                                }
                            },
                            {
                                new: true,
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
                error
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

module.exports.updateSharesInTeamwork = (req, res, teamWork) => {
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

    // Create arrays with OwnCloud IDs of guarantors and consultants
    const guarantorsAndConsultantsOwnCloudIds = []
    for (const guarantor of teamWork.guarantors) {
        if (guarantor.user != undefined) {
            if (guarantor.user.ownCloudId != undefined) {
                guarantorsAndConsultantsOwnCloudIds.push(guarantor.user.ownCloudId)
            }
        }
    }
    for (const consultant of teamWork.consultants) {
        if (consultant.user != undefined) {
            if (consultant.user.ownCloudId != undefined) {
                guarantorsAndConsultantsOwnCloudIds.push(consultant.user.ownCloudId)
            }
        }
    }
    let guarantorsAndConsultantsOwnCloudIdsToShare = [...guarantorsAndConsultantsOwnCloudIds]

    // Create array for promises
    const getSharePromises = []
    for (const array of [teamWork.owncloud.shares.students, teamWork.owncloud.shares.consultantsAndGuarants]) {
        for (const shareId of array) {
            getSharePromises.push(oc.shares.getShare(shareId))
        }
    }

    // Solve promises
    Promise.all(getSharePromises).then(shares => {
        // Create arrays for share IDs
        const studentsShares = []
        const guarantorsAndConsultantsShares = []
        for (const share of shares) {
            if (studentsOwnCloudIds.includes(share.shareInfo.share_with)) {
                studentsOwnCloudIdsToShare.remove(share.shareInfo.share_with)
                studentsShares.push(share.shareInfo.id)
            } else if (guarantorsAndConsultantsOwnCloudIds.includes(share.shareInfo.share_with)) {
                guarantorsAndConsultantsOwnCloudIdsToShare.remove(share.shareInfo.share_with)
                guarantorsAndConsultantsShares.push(share.shareInfo.id)
            } else {
                console.log(111)
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
            const guarantorsAndConsultantsPromises = []
            for (const userOwnCloudId of guarantorsAndConsultantsOwnCloudIdsToShare) {
                guarantorsAndConsultantsPromises.push(oc.shares.shareFileWithUser(getPath(teamWork), userOwnCloudId, { perms: 31 }))
            }
            Promise.all(guarantorsAndConsultantsPromises).then((values) => {
                for (const value of values) {
                    guarantorsAndConsultantsShares.push(value.shareInfo.id)
                }
                TeamWork
                    .findByIdAndUpdate(
                        teamWork._id,
                        {
                            owncloud: {
                                shares: {
                                    students: studentsShares,
                                    consultantsAndGuarants: guarantorsAndConsultantsShares,
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
                console.log(2)
                console.error(error)
                return res
                    .status(500)
                    .json({
                        status: 'error',
                        error
                    })
            })
        }).catch((error) => {
            console.log(1)
            console.error(error)
            return res
                .status(500)
                .json({
                    status: 'error',
                    error
                })
        })
    }).catch(error => {
        console.log(0)
        console.error(error)
        return res
            .status(500)
            .json({
                status: 'error',
                error
            })
    })
}