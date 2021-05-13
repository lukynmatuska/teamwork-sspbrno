function selectTeamWork($DOM, teamWorkId, positionId) {
    $DOM.text('Vybírám')
    $DOM.removeClass('bg-secondary text-light')
    $DOM.addClass('btn-dark')
    API.teamwork
        .select(teamWorkId, positionId)
        .then((response) => {
            $DOM.removeClass('btn-dark')
            if (response.status === 'ok') {
                $DOM.addClass('btn-success')
                $DOM.text('Vybráno')
                location.reload()
            } else if (response.error === 'already-asigned') {
                $DOM.text('Jejda! Někdo Vás předběhl')
                $DOM.addClass('btn-danger')
                location.reload()
            } else if (response.error === 'start-of-selection-of-teamworks') {
                $DOM.text('Jejda! Jste tu moc brzo. Volba týmových prácí ještě nezačala.')
                $DOM.addClass('btn-danger')
                setTimeout(function () {
                    location.reload()
                }, 10000)
            } else if (response.error === 'end-of-selection-of-teamworks') {
                $DOM.text('Jejda! Promeškal jste možnost volby týmové práce')
                $DOM.addClass('btn-danger')
                setTimeout(function () {
                    location.reload()
                }, 10000)
            } else {
                $DOM.text('Chyba!')
                console.error(response)
                $DOM.addClass('btn-danger')
            }
        })
}

async function isGivenSpecializationMine(specializationId) {
    const response = await API.user.isGivenSpecializationMine(String(specializationId))
    if (response == undefined || response == null) {
        return false
    }
    if (response.status != 'ok') {
        return false
    }
    return response.data
}

async function isGivenUserIdMine(userId) {
    const response = await API.user.isGivenUserIdMine(userId)
    if (!response) {
        return false
    }
    if (response.status != 'ok') {
        return false
    }
    return response.data
}

async function isGivenTeamworkMine(teamworkId) {
    const response = await API.teamwork.isGivenTeamworkMine(teamworkId)
    if (!response) {
        return false
    }
    if (response.status != 'ok') {
        return false
    }
    return response.data
}

async function hasStudentBeenAsignedToTeamWork() {
    const response = await API.teamwork.hasStudentBeenAsignedToTeamWork()
    if (!response) {
        return false
    }
    return response
}

async function studentsDOMsFromTeamwork(teamwork, isUserLoggedIn, hasStudentBeenAsignedToTeamWorkInVar) {
    let $students = $('<ul>', { class: 'list-group list-group-flush' })
    for (let ii = 0; ii < teamwork.students.length; ii++) {
        let teamworkPositionUser = teamwork.students[ii].user
        let studentPositionUserName = $('<span>', { class: 'text-success' }).text(` Volná pozice`)
        if (teamworkPositionUser === undefined || teamworkPositionUser === null) {
            if (isUserLoggedIn) {
                if (!hasStudentBeenAsignedToTeamWorkInVar) {
                    if (await isGivenSpecializationMine(teamwork.students[ii].position._id)) {
                        studentPositionUserName = $('<button>', {
                            class: 'btn btn-sm bg-secondary text-light ml-2', type: 'button',
                            onclick: `selectTeamWork($(this), '${teamwork._id}', '${teamwork.students[ii]._id}')`
                        }).text('Vybrat')
                    } else {
                        studentPositionUserName = $('<span>', { class: 'text-success' }).text(` Volná pozice jiné specializace`)
                    }
                }
            }
        } else {
            studentPositionUserName = $('<span>', { class: 'text-secondary' }).text('Obsazená pozice')
            if (isUserLoggedIn) {
                studentPositionUserName = $('<span>', { class: 'text-secondary' }).text(teamwork.students[ii].user.name.full)
                if (hasStudentBeenAsignedToTeamWorkInVar && teamwork.students[ii].user != undefined) {
                    if (await isGivenTeamworkMine(teamwork._id) && await isGivenUserIdMine(teamwork.students[ii].user._id)) {
                        studentPositionUserName = $('<span>', { class: 'text-secondary' }).text('Vaše pozice')
                    }
                }
            }
        }
        $students.append(
            $('<li>', { class: 'list-group-item' }).append(
                $('<strong>', { class: 'text-dark' }).text(`${teamwork.students[ii].position.name}: `),
                $('<span>', { class: 'text-dark' }).text(teamwork.students[ii].task),
                $('<span>', { class: 'text-secondary' }).text(' - '),
                studentPositionUserName
            )
        )
    }
    return $students
}

function usersDOMsFromTeamwork(teamwork, userType = 'guarantors') {
    let $users = $('<ul>', { class: 'list-group list-group-flush' })
    for (let i = 0; i < teamwork[userType].length; i++) {
        let name = teamwork[userType][i].user.name
        $users.append(
            $('<li>', { class: 'list-group-item' }).append(
                $('<strong>', { class: 'text-dark' }).text(
                    `${name.first} ${name.middle === undefined ? ' ' : ` ${name.middle} `} ${name.last}: `
                ),
                $('<span>', { class: 'text-secondary' }).text(teamwork[userType][i].task)
            )
        )
    }
    return $users
}

function teamWorkDetailButton(id) {
    return $('<a>', { class: 'btn btn-secondary', href: `/teamworks/detail/${id}` }).text('Detail')
}

async function teamWorkDOM(teamwork, isUserLoggedIn, hasStudentBeenAsignedToTeamWorkInVar) {
    const consultantsDOMs = usersDOMsFromTeamwork(teamwork, 'consultants')
    const guarantorsDOMs = usersDOMsFromTeamwork(teamwork);
    return $('<div>', { class: 'row mb-4' }).append(
        $('<div>', { class: 'col' }).append(
            $('<div>', { class: 'card flex-grow-1' }).append(
                $('<div>', { class: 'card-body' }).append(
                    $('<h3>', { class: 'card-title text-dark' }).text(teamwork.fullname),
                    $('<p>', { class: 'card-text text-muted' }).text(teamwork.description)
                ),
                $('<h4>', { class: 'card-title text-dark' }).text('Studenti'),
                await studentsDOMsFromTeamwork(teamwork, isUserLoggedIn, hasStudentBeenAsignedToTeamWorkInVar),
                (isUserLoggedIn ? $('<span>').append(
                    (guarantorsDOMs.children().length > 0 ? $('<h4>', { class: 'card-title text-dark mt-3' }).text('Garanti') : null),
                    guarantorsDOMs,
                    (consultantsDOMs.children().length > 0 ? $('<h4>', { class: 'card-title text-dark mt-3' }).text('Konzultanti') : null),
                    consultantsDOMs
                ) : null),
                !isUserLoggedIn ? null : (await isGivenTeamworkMine(teamwork._id) ? teamWorkDetailButton(teamwork._id) : null)
            )
        )
    )
}