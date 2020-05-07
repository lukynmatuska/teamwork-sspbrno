var API = {
  user: {
    new: function (
      username,
      password,
      email,
      firstname,
      lastname,
      middlename) {
      $.ajax({
        type: 'POST',
        url: '/api/user/new',
        data: {
          username: username,
          password: password,
          email: email,
          firstname: firstname,
          middlename: middlename,
          lastname: lastname
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    login: function (
      username,
      password) {
      $.ajax({
        type: 'POST',
        url: '/api/user/login',
        data: {
          username: username,
          password: password
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    forgotPassword: function (username) {
      $.ajax({
        type: 'POST',
        url: '/api/user/forgot-password',
        data: {
          username: username
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    setNewPassword: function (userId, password) {
      $.ajax({
        type: 'POST',
        url: '/api/user/set-new-password',
        data: {
          userId: userId,
          password: password
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    updateSession: function () {
      return $.get('/api/user/update-session', {}, 'json')
    },

    changeType: function (userId, type) {
      $.ajax({
        type: 'POST',
        url: '/api/user/change-type',
        data: {
          userId: userId,
          type: type
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    list: function () {
      return $.get('/api/user/list', {}, 'json')
    }
  },

  year: {
    list: function () {
      return $.get('/api/year/list', {}, 'json')
    }
  },

  specialization: {
    new: function (name, shortName) {
      $.ajax({
        type: 'POST',
        url: '/api/specialization/new',
        data: {
          name: name,
          short: shortName
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    edit: function (name, shortName) {
      $.ajax({
        type: 'POST',
        url: '/api/specialization/edit',
        data: {
          name: name,
          short: shortName
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    delete: function (id) {
      $.ajax({
        type: 'POST',
        url: '/api/specialization/delete',
        data: {
          id: id
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    list: function () {
      return $.get('/api/specialization/list', {}, 'json')
    }
  },

  teamwork: {
    new: function (name, description, students, guarantors) {
      $.ajax({
        type: 'POST',
        url: '/api/teamwork/new',
        data: {
          name: name,
          description: description,
          students: students,
          guarantors: guarantors
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    edit: function (name, description, students, guarantors) {
      $.ajax({
        type: 'POST',
        url: '/api/teamwork/edit',
        data: {
          name: name,
          description: description,
          students: students,
          guarantors: guarantors
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    delete: function (id) {
      $.ajax({
        type: 'POST',
        url: '/api/teamwork/delete',
        data: {
          id: id
        },
        success: function (data, textStatus) {
          return data
        },
        dataType: 'string'
      })
    },

    list: function () {
      return $.get('/api/teamwork/list', {}, 'json')
    }
  }
}
