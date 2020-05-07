var API = {
  user: {
    new: function (
      username,
      password,
      email,
      firstname,
      lastname,
      middlename) {
      return $.post(
        '/api/user/new',
        {
          username: username,
          password: password,
          email: email,
          firstname: firstname,
          middlename: middlename,
          lastname: lastname
        },
        'json'
      )
    },

    login: function (username, password) {
      return $.post(
        '/api/user/login',
        {
          username: username,
          password: password
        },
        'json'
      )
    },

    forgotPassword: function (username) {
      return $.post(
        '/api/user/forgot-password',
        {
          username: username
        },
        'json'
      )
    },

    setNewPassword: function (userId, password) {
      return $.post(
        '/api/user/set-new-password',
        {
          id: userId,
          password: password
        },
        'json'
      )
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
    }
  },

  year: {
    list: function () {
      return $.get('/api/year/list', {}, 'json')
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

    edit: function (name, shortName) {
      return $.post(
        '/api/specialization/edit',
        {
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

    list: function () {
      return $.get('/api/specialization/list', {}, 'json')
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

    edit: function (name, description, students, guarantors) {
      return $.post(
        '/api/teamwork/edit',
        {
          name: name,
          description: description,
          students: students,
          guarantors: guarantors
        },
        'json'
      )
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

    list: function () {
      return $.get('/api/teamwork/list', {}, 'json')
    }
  }
}
