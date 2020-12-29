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
      return postData(
        '/user/login',
        {
          email: email,
          password: password
        }
      )
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
      return postData(
        '/user/change-type',
        {
          id: userId,
          type: type
        }
      )
    },

    list: function () {
      return getData('/user/list')
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
    new: function (name, description, status) {
      return postData(
        '/year/new',
        {
          name: name,
          description: description,
          status: status
        }
      )
    },

    edit: function (yearId, name, description, status) {
      return postData(
        '/year/edit',
        {
          id: yearId,
          name: name,
          description: description,
          status: status
        }
      )
    },

    list: function () {
      return getData('/year/list')
    },

    delete: function (yearId) {
      return postData(
        '/year/delete',
        {
          id: yearId
        }
      )
    },

    switch: function (yearId) {
      return postData(
        '/year/switch',
        {
          id: yearId
        }
      )
    }
  },

  specialization: {
    new: function (name, shortName) {
      return postData(
        '/specialization/new',
        {
          name: name,
          short: shortName
        }
      )
    },

    edit: function (id, name, shortName) {
      return postData(
        '/specialization/edit',
        {
          id: id,
          name: name,
          short: shortName
        }
      )
    },

    delete: function (id) {
      return postData('/specialization/delete', { id })
    },

    list: function (filter) {
      if (filter === undefined) {
        filter = {}
      }
      return getData('/specialization/list', filter)
    }
  },

  teamwork: {
    new: function (name, description, students, guarantors, consultants) {
      return postData( '/teamwork/new', { name, description, students, guarantors, consultants })
    },

    edit: function (id, name, description, students, guarantors, consultants) {
      return postData( '/teamwork/edit', { id, name, description, students, guarantors, consultants })
    },

    findById: function (id) {
      return getData('/teamwork/find-by-id/' + id)
    },

    delete: function (id) {
      return postData('/teamwork/delete', { id: id })
    },

    list: function (filter) {
      const data = {}
      if (filter !== undefined) {
        data.filter = filter
      }
      return getData('/teamwork/list', data)
    },

    select: function (
      teamWorkId,
      positionId
    ) {
      return postData(
        '/teamwork/select',
        {
          id: teamWorkId,
          position: positionId
        }
      )
    },

    leave: function (
      teamWorkId,
      positionId
    ) {
      return postData(
        '/teamwork/leave',
        {
          id: teamWorkId,
          position: positionId
        }
      )
    },

    hasStudentBeenAsignedToTeamWork: function () {
      return getData('/teamwork/has-student-been-asigned-to-teamwork')
    }
  }
}
