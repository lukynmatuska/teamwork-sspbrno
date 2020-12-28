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

var API = {
  endpoint: '/api',
  user: {
    new: function (
      email,
      password,
      firstname,
      lastname,
      specialization,
      middlename,
      usertype) {
      return $.post(
        '/api/user/new',
        {
          email: email,
          password: password,
          firstname: firstname,
          middlename: middlename,
          lastname: lastname,
          usertype: usertype,
          specialization: specialization
        },
        'json'
      )
    },

    login: function (email, password) {
      return $.post(
        '/api/user/login',
        {
          email: email,
          password: password
        },
        'json'
      )
    },

    parseXlsx: function (file, userType) {
      let body = new FormData()
      body.append('xlsx', file)
      body.append('userType', userType)
      return fetch(
        '/api/user/parse-xlsx',
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
        '/api/user/import',
        {
          method: 'POST',
          body: body
        }
      )
    },

    edit: function (object) {
      return $.post(
        '/api/user/edit',
        object,
        'json'
      )
    },

    forgotPassword: function (email) {
      return postData('/user/forgot-password', { email })
    },

    setNewPassword: function (userId, password) {
      return postData('/user/set-new-password', { id: userId, password })
    },

    updateSession: function () {
      return $.get('/api/user/update-session', {}, 'json')
    },

    changeType: function (userId, type) {
      return $.post(
        '/api/user/change-type',
        {
          id: userId,
          type: type
        },
        'json'
      )
    },

    list: function () {
      return $.get('/api/user/list', {}, 'json')
    },

    logout: function () {
      return $.get('/api/user/logout', {}, 'json')
    },

    delete: function (userId) {
      return $.post(
        '/api/user/delete',
        {
          id: userId
        },
        'json'
      )
    },

    loggedIn: function () {
      return $.get('/api/user/am-i-logged-in', {}, 'json')
    }
  },

  year: {
    new: function (name, description, status) {
      return $.post(
        '/api/year/new',
        {
          name: name,
          description: description,
          status: status
        },
        'json'
      )
    },

    edit: function (yearId, name, description, status) {
      return $.post(
        '/api/year/edit',
        {
          id: yearId,
          name: name,
          description: description,
          status: status
        },
        'json'
      )
    },

    list: function () {
      return $.get('/api/year/list', {}, 'json')
    },

    delete: function (yearId) {
      return $.post(
        '/api/year/delete',
        {
          id: yearId
        },
        'json'
      )
    },

    switch: function (yearId) {
      return $.post(
        '/api/year/switch',
        {
          id: yearId
        },
        'json'
      )
    }
  },

  specialization: {
    new: function (name, shortName) {
      return $.post(
        '/api/specialization/new',
        {
          name: name,
          short: shortName
        },
        'json'
      )
    },

    edit: function (id, name, shortName) {
      return $.post(
        '/api/specialization/edit',
        {
          id: id,
          name: name,
          short: shortName
        },
        'json'
      )
    },

    delete: function (id) {
      return $.post(
        '/api/specialization/delete',
        {
          id: id
        },
        'json'
      )
    },

    list: function (filter) {
      if (filter === undefined) {
        filter = {}
      }
      return $.get('/api/specialization/list', filter, 'json')
    }
  },

  teamwork: {
    new: function (name, description, students, guarantors) {
      return $.post(
        '/api/teamwork/new',
        {
          name: name,
          description: description,
          students: students,
          guarantors: guarantors
        },
        'json'
      )
    },

    edit: function (id, name, description, students, guarantors) {
      return $.post(
        '/api/teamwork/edit',
        {
          id: id,
          name: name,
          description: description,
          students: students,
          guarantors: guarantors
        },
        'json'
      )
    },

    findById: function (id) {
      return $.get('/api/teamwork/find-by-id/' + id, {}, 'json')
    },

    delete: function (id) {
      return $.post(
        '/api/teamwork/delete',
        {
          id: id
        },
        'json'
      )
    },

    list: function (filter) {
      if (filter === undefined) {
        filter = {}
      }
      return $.get('/api/teamwork/list', { filter: filter }, 'json')
    },

    select: function (
      teamWorkId,
      positionId
    ) {
      return $.post(
        '/api/teamwork/select',
        {
          id: teamWorkId,
          position: positionId
        },
        'json'
      )
    },

    leave: function (
      teamWorkId,
      positionId
    ) {
      return $.post(
        '/api/teamwork/leave',
        {
          id: teamWorkId,
          position: positionId
        },
        'json'
      )
    },

    hasStudentBeenAsignedToTeamWork: function () {
      return $.get('/api/teamwork/has-student-been-asigned-to-teamwork', {}, 'json')
    }
  }
}
