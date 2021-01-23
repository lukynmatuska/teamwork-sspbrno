/**
 * Page controller
 * @author Lukas Matuska (lukynmatuska@gmail.com)
 * @version 1.0
 */

/**
 * Libs
 */
const emailController = require('../email')

/**
 * Models
 */
const TeamWork = require('../../models/TeamWork')
const TeamWorkTemplate = require('../../models/TeamWorkTemplate')
const User = require('../../models/User')
const Year = require('../../models/Year')
const Specialization = require('../../models/Specialization')
const { rmSync } = require('fs')

module.exports.dashboard = (req, res) => {
  res.render('admin/dashboard', { req, res, active: 'dashboard', title: 'Přehled' })
}

module.exports.teamworks = {
  list: (req, res) => {
    res.render('admin/teamworks/list', { req, res, active: 'teamworks', title: 'Seznam týmových prací' })
  },
  new: (req, res) => {
    res.render('admin/teamworks/new', { req, res, active: 'teamworks', title: 'Nová týmová práce' })
  },
  edit: (req, res) => {
    TeamWork
      .findById(req.params.id)
      .exec((err, teamwork) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        if (teamwork === null) {
          return this.error.notFound(
            req, res,
            '404 Týmová práce nenalezena',
            'Hledáte týmovou práci, která se nenachází v databázi, přeji Vám příjmenou hru na schovávanou.'
          )
        }
        res.render('admin/teamworks/edit', { req, res, active: 'teamworks', title: 'Editace týmové práce' })
      })
  },
  detail: (req, res) => {
    TeamWork
      .findById(req.params.id)
      .populate({
        path: 'students.user',
        select: 'name email photo type'
      })
      .populate('students.position')
      .populate({
        path: 'guarantors.user',
        select: 'name email photo type'
      })
      .populate('year')
      .populate({
        path: 'author',
        select: 'name email photo type'
      })
      .exec((err, teamwork) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        if (teamwork === null) {
          return this.error.notFound(
            req, res,
            '404 Týmová práce nenalezena',
            'Hledáte týmovou práci, která se nenachází v databázi, přeji Vám příjmenou hru na schovávanou.'
          )
        }
        res.render('admin/teamworks/detail', { req, res, active: 'teamworks', title: 'Detail týmové práce', teamwork })
      })
  }
}

module.exports.users = {
  list: (req, res) => {
    res.render('admin/users/list', { req, res, active: 'users', title: 'Seznam uživatelů' })
  },
  new: (req, res) => {
    res.render('admin/users/new', { req, res, active: 'users', title: 'Nový uživatel' })
  },
  import: (req, res) => {
    res.render('admin/users/import', { req, res, active: 'users', title: 'Import uživatelů' })
  },
  edit: (req, res) => {
    User
      .findById(req.params.id)
      .populate('years.year')
      .exec((err, user) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        if (user === null) {
          return this.error.notFound(
            req, res,
            '404 Uživatel nenalezen',
            'Hledáte uživatele, který se nenachází v databázi, přeji Vám příjmenou hru na schovávanou.'
          )
        }
        Year
          .find({})
          .exec((err, years) => {
            if (err) {
              this.error.internalError(req, res)
              return console.error(err)
            }
            res.render('admin/users/edit', { req, res, active: 'users', title: 'Editace uživatele', user, years })
          })
      })
  },
  detail: (req, res) => {
    User
      .findById(req.params.id)
      .populate('years.year')
      .exec((err, user) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        if (user === null) {
          return this.error.notFound(
            req, res,
            '404 Uživatel nenalezen',
            'Hledáte uživatele, který se nenachází v databázi, přeji Vám příjmenou hru na schovávanou.'
          )
        }
        Year
          .find({})
          .exec((err, years) => {
            if (err) {
              this.error.internalError(req, res)
              return console.error(err)
            }
            res.render('admin/users/detail', { req, res, active: 'users', title: 'Detail uživatele', user, years })
          })
      })
  }
}

module.exports.teamworktemplates = {
  list: (req, res) => {
    res.render('admin/teamworktemplates/list', { req, res, active: 'teamworktemplates', title: 'Seznam šablon týmových prací' })
  },
  new: (req, res) => {
    res.render('admin/teamworktemplates/new', { req, res, active: 'teamworktemplates', title: 'Nová šablona týmové práce' })
  },
  edit: (req, res) => {
    TeamWorkTemplate
      .findById(req.params.id)
      .exec((err, teamwork) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        if (teamwork === null) {
          return this.error.notFound(
            req, res,
            '404 Šablona týmové práce nenalezena',
            'Hledáte šablonu týmové práce, která se nenachází v databázi, přeji Vám příjmenou hru na schovávanou.'
          )
        }
        res.render('admin/teamworktemplates/edit', { req, res, active: 'teamworktemplates', title: 'Editace šablony týmové práce' })
      })
  },
  detail: (req, res) => {
    TeamWorkTemplate
      .findById(req.params.id)
      .populate({
        path: 'students.user',
        select: 'name email photo type'
      })
      .populate('students.position')
      .populate({
        path: 'guarantors.user',
        select: 'name email photo type'
      })
      .populate('year')
      .populate({
        path: 'author',
        select: 'name email photo type'
      })
      .exec((err, teamworktemplates) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        if (teamworktemplates === null) {
          return this.error.notFound(
            req, res,
            '404 Šablona týmové práce nenalezena',
            'Hledáte šablonu týmové práce, která se nenachází v databázi, přeji Vám příjmenou hru na schovávanou.'
          )
        }
        res.render('admin/teamworktemplates/detail', { req, res, active: 'teamworktemplates', title: 'Detail šablony týmové práce', teamworktemplates })
      })
  }
}

module.exports.specializations = {
  list: (req, res) => {
    res.render('admin/specializations/list', { req, res, active: 'specializations', title: 'Seznam zaměření' })
  },
  new: (req, res) => {
    res.render('admin/specializations/new', { req, res, active: 'specializations', title: 'Nové zaměření' })
  },
  edit: (req, res) => {
    Specialization
      .findById(req.params.id)
      .exec((err, specialization) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        if (specialization === null) {
          return this.error.notFound(
            req, res,
            '404 Zaměření nenalezeno',
            'Hledáte zaměření, které se tu nenachází, přeji Vám příjmenou hru na schovávanou.'
          )
        }
        res.render('admin/specializations/edit', { req, res, active: 'specializations', title: 'Editace zaměření', specialization })
      })
  }
}

module.exports.years = {
  list: (req, res) => {
    res.render('admin/years/list', { req, res, active: 'years', title: 'Seznam ročníků' })
  },
  new: (req, res) => {
    res.render('admin/years/new', { req, res, active: 'years', title: 'Nový ročník' })
  },
  edit: (req, res) => {
    Year
      .findById(req.params.id)
      // .populate('author')
      .exec((err, year) => {
        if (err) {
          this.error.internalError(req, res)
          return console.error(err)
        }
        if (year === null) {
          return this.error.notFound(
            req, res,
            '404 Ročník nenalezen',
            'Hledáte ročník, který se tu nenachází, přeji Vám příjmenou hru na schovávanou.'
          )
        }
        res.render('admin/years/edit', { req, res, active: 'years', title: 'Editace ročníku', year })
      })
  }
}

module.exports.profile = (req, res) => {
  res.render('admin/profile', { req, res, active: 'profile', title: 'Profil' })
}

module.exports.error = {
  accessDenied: (req, res) => {
    res.render('admin/errors/403', { req, res, active: 'error', title: '403 Přístup odepřen' })
  },
  notFound: (req, res, title = '404 Nenalezeno', description = 'Hledáte soubor, který se tu nenachází, přeji Vám příjmenou hru na schovávanou.') => {
    res.render('admin/errors/404', { req, res, active: 'error', title, description })
  },
  internalError: (req, res) => {
    res.render('admin/errors/500', { req, res, active: 'error', title: '500 Chyba serveru' })
  }
}

module.exports.emails = {
  list: (req, res) => {
    res.render('admin/emails/list', { req, res, active: 'emails', title: 'Seznam šablon emailů'})
  },
  edit: (req, res) => {
    if (req.params.id == undefined) {
      return this.error.notFound(req, res)
    } else if (!emailController.exists(req.params.id)) {
      return this.error.notFound(req, res)
    }
    emailController.read(req.params.id, (err, data) => {
      if (err) {
        console.error(err)
        return this.error.internalError(req, res)
      }
      data = JSON.parse(data)
      res.render('admin/emails/edit', { req, res, active: 'emails', title: 'Editace šablony emailu', name: data.name, subject: data.subject, body: data.body })
    })
  }
}
