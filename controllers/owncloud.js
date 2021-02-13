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

module.exports.newTeamwork = (req, res, teamwork) => {
    let path = `${global.CONFIG.owncloud.folder}${teamwork._id}`
    let guarantorsAndConsultants = new Set()
    for (let i = 0; i < teamwork.guarantors.length; i++) {
        if (teamwork.guarantors[i].user != undefined) {
            guarantorsAndConsultants.add(String(teamwork.guarantors[i].user.ownCloudId))
        }
    }
    for (let i = 0; i < teamwork.consultants.length; i++) {
        if (teamwork.consultants[i].user != undefined) {
            guarantorsAndConsultants.add(String(teamwork.consultants[i].user.ownCloudId))
        }
    }
    let students = []
    for (const student of teamwork.students) {
        if (student.user != undefined) {
            students.push(student.user.ownCloudId)
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
                            }
                        )
                        .exec((err) => {
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
