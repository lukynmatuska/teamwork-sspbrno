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
    url.searchParams.set(keys[i], JSON.stringify(values[i]))
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
    referrerPolicy: 'no-referrer',
    // body: JSON.stringify(data)
  })
  return response.json()
}


function switchYear(yearId) {
  swal({
    title: "Přepíná se rok ...",
    text: "Vydržte prosím moment ...",
    icon: "warning",
    timer: 1500,
  }).then((value) => {
    API.year
      .switch(yearId)
      .then(function (response) {
        if (response.status === 'ok') {
          return swal({
            title: 'Rok se změnil!',
            text: 'Jaká byla cesta časem?',
            icon: 'success',
            timer: 3000,
          }).then((value) => {
            location.reload()
          })
        }

        console.error(response)
        switch (response.error) {
          case 'not-permissions-for-this-year':
            swal({
              title: 'Rok se nezměnil!',
              text: 'Nastala chyba, protože nemáte práva na ročník, na který se chcete přepnout.',
              icon: 'error',
            })
            break

          case 'not-found-year-bad-id':
            swal({
              title: 'Rok se nezměnil!',
              text: 'Nastala chyba, protože jste na server poslal(a) špatné id ročníku, na který se chcete přepnout.',
              icon: 'error',
            })
            break

          case 'not-sent-id':
            swal({
              title: 'Rok se nezměnil!',
              text: 'Nastala chyba, protože jste neposlal(a) na server id ročníku, na který se chcete přepnout.',
              icon: 'error',
            })
            break
        }
      })
  })
}

function updateSession() {
  swal({
    title: "Sezení se aktualizuje!",
    text: "Vydržte prosím ...",
    icon: "warning",
    timer: 2000,
  }).then((value) => {
    API.user
      .updateSession()
      .then(function (response) {
        if (response.status === 'ok') {
          swal({
            title: 'Gratuluji!',
            text: 'Sezení bylo aktualizováno.',
            icon: 'success',
            timer: 3000,
          }).then(() => {
            location.reload()
          })
        } else {
          console.error(response)
          swal({
            title: 'Chyba!',
            text: `Kontaktuj správce prosím tě a vzkaž mu: '${response.error}'`,
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

    parseXlsx: function (file, userType) {
      let body = new FormData()
      body.append('xlsx', file)
      body.append('userType', userType)
      return fetch(
        API.endpoint + '/user/parse-xlsx',
        {
          method: 'POST',
          body: body
        }
      )
    },

    import: function (users, userType) {
      let body = new FormData()
      body.append('users', JSON.stringify(users))
      body.append('userType', userType)
      return fetch(
        API.endpoint + '/user/import',
        {
          method: 'POST',
          body: body
        }
      )
    },

    edit: function (object) {
      return postData('/user/edit', object)
    },

    forgotPassword: function (email) {
      return postData('/user/forgot-password', { email })
    },

    setNewPassword: function (userId, password) {
      return postData('/user/set-new-password', { id: userId, password })
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
    }
  },

  year: {
    new: function (name, description, status, endOfSelectionOfTeamWorks) {
      return postData('/year/new', { name, description, status, endOfSelectionOfTeamWorks })
    },

    edit: function (yearId, name, description, status, endOfSelectionOfTeamWorks) {
      return postData('/year/edit', { id: yearId, name, description, status, endOfSelectionOfTeamWorks })
    },

    list: function (filter = {}) {
      return getData('/year/list', filter)
    },

    delete: function (yearId) {
      return postData('/year/delete', { id: yearId })
    },

    switch: function (yearId) {
      return postData('/year/switch', { id: yearId })
    }
  },

  specialization: {
    new: function (name, shortName) {
      return postData('/specialization/new', { name, short: shortName })
    },

    edit: function (id, name, shortName) {
      return postData('/specialization/edit', { endOfSelectionOfTeamWorks, id, name, short: shortName })
    },

    delete: function (id) {
      return postData('/specialization/delete', { id })
    },

    list: function (filter = {}) {
      return getData('/specialization/list', filter)
    }
  },

  teamwork: {
    new: function (name, description, students, guarantors, consultants) {
      return postData('/teamwork/new', { name, description, students, guarantors, consultants })
    },

    edit: function (id, name, description, students, guarantors, consultants) {
      return postData('/teamwork/edit', { id, name, description, students, guarantors, consultants })
    },

    findById: function (id) {
      return getData('/teamwork/find-by-id/' + id)
    },

    copy: function (id) {
      return postData('/teamwork/copy', { id })
    },

    delete: function (id) {
      return postData('/teamwork/delete', { id })
    },

    list: function (filter = {}) {
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
    }
  }
}
