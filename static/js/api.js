var API = {
  user: {
    new: function (
      username,
      password,
      email,
      firstname,
      lastname,
      middlename,
      usertype) {
      return $.post(
        '/api/user/new',
        {
          username: username,
          password: password,
          email: email,
          firstname: firstname,
          middlename: middlename,
          lastname: lastname,
          usertype: usertype
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

    edit: function (object) {
      return $.post(
        '/api/user/edit',
        object,
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
    },

    delete: function (userId) {
      return $.post(
        '/api/user/delete',
        {
          id: userId
        },
        'json'
      )
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

    list: function () {
      return $.get('/api/teamwork/list', {}, 'json')
    },

    listWithFilter: function (filter) {
      return $.get('/api/teamwork/list', {
        filter: filter
      }, 'json')
    }
  }
}
