function generateAvatar(name) {
  name = name.split(' ')
  var initials = name[name.length - 1][0] + name[0][0]
  var canvas = document.createElement('canvas');
  var radius = 30;
  var margin = 5;
  canvas.width = radius * 2 + margin * 2;
  canvas.height = radius * 2 + margin * 2;

  // Get the drawing context
  var ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(radius + margin, radius + margin, radius, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "bold 30px Open Sans,sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(initials, radius + 5, radius * 4 / 3 + margin);
  return canvas.toDataURL();
  //The canvas will never be added to the document.
}

// Example POST method implementation:
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch((API.endpoint + url), {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
  return response.json() // parses JSON response into native JavaScript objects
}

async function getData(path = '', data = {}) {
  const url = new URL(window.location.origin + API.endpoint + path)
  const keys = Object.keys(data)
  const values = Object.values(data)
  for (let i = 0; i < values.length; i++) {
    let value = values[i]
    if (typeof value == 'object') {
      value = JSON.stringify(value)
    }
    url.searchParams.set(keys[i], value)
  }
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  })
  return response.json()
}


function switchYear(yearId) {
  API.year
    .switch(yearId)
    .then(function (response) {
      if (response.status === 'ok') {
        return Swal.fire({
          title: 'Rok se změnil!',
          text: 'Jaká byla cesta časem?',
          icon: 'success',
          timer: 1500,
        }).then((value) => {
          location.reload()
        })
      }
      console.error(response)
      switch (response.error) {
        case 'not-permissions-for-this-year':
          return Swal.fire({
            title: 'Rok se nezměnil!',
            text: 'Nastala chyba, protože nemáte práva na ročník, na který se chcete přepnout.',
            icon: 'error',
          })
          break

        case 'not-found-year-bad-id':
          return Swal.fire({
            title: 'Rok se nezměnil!',
            text: 'Nastala chyba, protože jste na server poslal(a) špatné id ročníku, na který se chcete přepnout.',
            icon: 'error',
          })
          break

        case 'not-sent-id':
          return Swal.fire({
            title: 'Rok se nezměnil!',
            text: 'Nastala chyba, protože jste neposlal(a) na server id ročníku, na který se chcete přepnout.',
            icon: 'error',
          })
          break

        default:
          return Swal.fire({
            title: 'Rok se nezměnil!',
            text: `Nastala chyba ${response.error}`,
            icon: 'error',
          })
          break
      }
    })
}

function updateSession() {
  Swal.fire({
    title: "Sezení se aktualizuje!",
    text: "Vydržte prosím ...",
    icon: "warning",
    timer: 500,
  }).then((value) => {
    API.user
      .updateSession()
      .then(function (response) {
        if (response.status === 'ok') {
          Swal.fire({
            title: 'Gratuluji!',
            text: 'Sezení bylo aktualizováno.',
            icon: 'success',
            timer: 3000,
          }).then(() => {
            location.reload()
          })
        } else {
          console.error(response)
          Swal.fire({
            title: 'Chyba!',
            text: `Kontaktujte správce prosím Vás a vzkažte mu: '${response.error}'`,
            icon: 'error',
          })
        }
      })
  })
}

var API = {
  endpoint: '/api',
  user: {
    new: function (
      email,
      password,
      firstname,
      lastname,
      middlename,
      usertype,
      specialization) {
      return postData(
        '/user/new',
        {
          email,
          password,
          firstname,
          middlename,
          lastname,
          usertype,
          specialization
        }
      )
    },

    login: function (email, password) {
      return postData('/user/login', { email, password })
    },

    parseStudentsXlsx: function (file) {
      let body = new FormData()
      body.append('xlsx', file)
      return fetch(
        API.endpoint + '/user/parse-students-xlsx',
        {
          method: 'POST',
          body: body
        }
      )
    },

    import: function (user) {
      let body = new FormData()
      body.append('user', JSON.stringify(user))
      return fetch(
        API.endpoint + '/user/import',
        {
          method: 'POST',
          body: body
        }
      )
    },

    /*import: function (user) {
      return postData('/user/import', { user })
    },*/

    edit: function (object) {
      return postData('/user/edit', object)
    },

    forgotPassword: function (email) {
      return postData('/user/forgot-password', { email })
    },

    rescuePassword: function (hash, password) {
      return postData('/user/rescue-password', { hash, password })
    },

    setNewPassword: function (userId, password) {
      return postData('/user/set-new-password', { id: userId, password })
    },

    updatePassword: function (oldPassword, newPassword, newPasswordRepeat) {
      return postData('/user/update-password', { oldPassword, newPassword, newPasswordRepeat })
    },

    updateSession: function () {
      return getData('/user/update-session')
    },

    changeType: function (userId, type) {
      return postData('/user/change-type', { id: userId, type })
    },

    list: function (filter) {
      const data = {}
      if (filter !== undefined) {
        data.filter = filter
      }
      return getData('/user/list', data)
    },

    logout: function () {
      return getData('/user/logout')
    },

    delete: function (userId) {
      return postData('/user/delete', { id: userId })
    },

    loggedIn: function () {
      return getData('/user/am-i-logged-in')
    },

    isGivenSpecializationMine: function (specializationId) {
      return getData('/user/is-given-specialization-mine', { id: specializationId })
    },

    hasUserGivenSpecialization: function (UserId, specializationId) {
      return getData('/user/has-user-given-specialization', { id: UserId, specialization: specializationId })
    },

    isGivenUserIdMine: function (UserId) {
      return getData('/user/is-given-id-mine', { id: UserId })
    },

    updateProfilePhoto: async function (file) {
      let body = new FormData()
      body.append('photo', file)
      const request = await fetch(API.endpoint + '/user/update-profile-photo', { method: 'POST', body })
      return request.json()
    }
  },

  year: {
    new: function (name, description, status, startOfSelectionOfTeamWorks, endOfSelectionOfTeamWorks) {
      return postData('/year/new', { name, description, status, startOfSelectionOfTeamWorks, endOfSelectionOfTeamWorks })
    },

    edit: function (yearId, name, description, status, startOfSelectionOfTeamWorks, endOfSelectionOfTeamWorks) {
      return postData('/year/edit', { id: yearId, name, description, status, startOfSelectionOfTeamWorks, endOfSelectionOfTeamWorks })
    },

    list: function (filter = {}) {
      return getData('/year/list', filter)
    },

    delete: function (yearId) {
      return postData('/year/delete', { id: yearId })
    },

    switch: function (yearId) {
      return postData('/year/switch', { id: yearId })
    },

    canStudentsJoinOrLeaveTeamwork: function () {
      return getData('/year/can-students-join-or-leave-teamwork')
    }
  },

  specialization: {
    new: function (name, shortName) {
      return postData('/specialization/new', { name, short: shortName })
    },

    edit: function (id, name, shortName) {
      return postData('/specialization/edit', { startOfSelectionOfTeamWorks, endOfSelectionOfTeamWorks, id, name, short: shortName })
    },

    delete: function (id) {
      return postData('/specialization/delete', { id })
    },

    list: function (filter = {}) {
      return getData('/specialization/list', filter)
    }
  },

  teamwork: {
    new: function (name, description, students, guarantors, consultants, result) {
      return postData('/teamwork/new', { name, description, students, guarantors, consultants, result })
    },

    edit: function (id, name, description, students, guarantors, consultants, result, number, media, year) {
      return postData('/teamwork/edit', { id, name, description, students, guarantors, consultants, result, number, media, year })
    },

    findById: function (id) {
      return getData('/teamwork/find-by-id/' + id)
    },

    copy: function (id, year) {
      return postData('/teamwork/copy', { id, year })
    },

    delete: function (id) {
      return postData('/teamwork/delete', { id })
    },

    list: function (filter = undefined) {
      return getData('/teamwork/list', filter)
    },

    select: function (teamWorkId, positionId) {
      return postData('/teamwork/select', { id: teamWorkId, position: positionId })
    },

    leave: function (teamWorkId, positionId) {
      return postData('/teamwork/leave', { id: teamWorkId, position: positionId })
    },

    hasStudentBeenAsignedToTeamWork: function () {
      return getData('/teamwork/has-student-been-asigned-to-teamwork')
    },

    isGivenTeamworkMine: function (UserId) {
      return getData('/teamwork/is-given-teamwork-mine', { id: UserId })
    }
  },

  teamworktemplate: {
    new: function (name, description, students, guarantors, consultants, result, label) {
      return postData('/teamworktemplate/new', { name, description, students, guarantors, consultants, result, label })
    },

    edit: function (id, name, description, students, guarantors, consultants, result, label) {
      return postData('/teamworktemplate/edit', { id, name, description, students, guarantors, consultants, result, label })
    },

    findById: function (id) {
      return getData('/teamworktemplate/find-by-id/' + id)
    },

    copy: function (id) {
      return postData('/teamworktemplate/copy', { id })
    },

    deploy: function (id, year) {
      return postData('/teamworktemplate/deploy', { id, year })
    },

    delete: function (id) {
      return postData('/teamworktemplate/delete', { id })
    },

    list: function (filter = {}) {
      return getData('/teamworktemplate/list', filter)
    },
  },

  email: {
    edit: function (id, subject, body) {
      return postData('/email/edit', { id, subject, body })
    },
    
    list: function () {
      return getData('/email/list')
    }
  },

  common: {
    dashboard: function () {
      return getData('/common/dashboard')
    },
  },
}

function dashboardCards() {
  // let $cards = $('div#cards')
  API.common
    .dashboard()
    .then((data) => {
      // console.log(data)
      if (data.specializations != undefined) {
        $('table#specializations').DataTable({
          language: {
            url: '/js/dataTables/myCzech.json'
          },
          order: [[0, "desc"]],
          responsive: true,
          data: data.specializations,
          columns: [
            {
              data: 'name',
            }, {
              data: 'countOfStudents',
            }, {
              data: 'countOfPositionsInTeamworks',
            }, {
              data: 'countOfStudentsInTeamworks',
            }, {
              data: 'name',
              fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                $(nTd).html((oData.countOfPositionsInTeamworks - oData.countOfStudentsInTeamworks))
              }
            }, {
              data: 'name',
              fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                let val = oData.countOfPositionsInTeamworks - oData.countOfStudentsInTeamworks - oData.countOfStudents
                $(nTd).html(val > 0 ? val : 0)
              }
            },
          ],
        })
        /* for (let i = 0; i < data.specializations.length; i++) {
          const specialization = data.specializations[i]
          $cards.append(
            $('<div>', { class: 'col-xl-3 col-lg-6 m-auto' }).append(
              $('<div>', { class: 'card card-stats' }).append(
                $('<div>', { class: 'card-body' }).append(
                  $('<div>', { class: 'row' }).append(
                    $('<div>', { class: 'col' }).append(
                      $('<h5>', { class: 'card-title text-uppercase text-muted mb-0' }).text(specialization.name),
                      $('<span>', { class: 'h2 font-weight-bold mb-0' }).append(
                        specialization.countOfStudents,
                        $('<span>', {class: 'p'}).text(' stud'),
                        specialization.countOfStudents,
                        $('<span>', {class: 'p'}).text('stud'),
                      )
                    ),
                    $('<div>', { class: 'col-auto' }).append(
                      $('<div>', { class: 'icon icon-shape bg-danger text-white rounded-circle shadow' }).append(
                        $('<i>', { class: 'fas fa-users' })
                      )
                    )
                  )
                )
              )
            )
          )
        } */
      }
    })
}