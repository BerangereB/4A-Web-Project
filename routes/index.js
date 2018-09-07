var express = require('express');
var router = express.Router();

var users = [{
    isAdmin: true,
    username: 'bourdoulous berangere',
    gender: 'F',
    email: 'bourdoulous@et.esiea.fr',
    password: 'Jn3F3GMNd',
    state: 0,
    panier: []
  },
  {
    isAdmin: true,
    username: "varatarajah iynthurisha",
    gender: 'F',
    email: "varatarajah@et.esiea.fr",
    password: "******",
    state: 0,
    panier: []
  }
]

router.get('/disconnect.html', function (req, res) {

  var email = req.query.email
  console.log(' ****** Déconnexion de : ', email)

  var index = get_index_of(email)

  console.log(index)
  if (index === -1) {
    console.log('Email X')
    console.log(' => La déconnexion a échoué')
    res.send('undefined email')
  } else {
    console.log('Email OK')
    console.log(' => La déconnexion a réussi')
    users[index].state = 0

    res.send('OK')
  }

})

function get_index_of(email) {
  console.log('Fonction : recherche de l\'indice correspondant à : ', email)
  var index = -1
  loop: {
    for (let i = 0; i < users.length; i++) {
      console.log(users[i], index)
      if (users[i].email === email) {
        index = i
        break loop;
      }
    }
  }
  console.log('Return : ', index)
  return index
}



router.post('/connect.html', function (req, res) {

  var email = req.body.email
  var password = req.body.password
  var gender = ''
  var isAdmin = false
  var errors = []

  console.log(' ****** Tentative de connexion de : ', email)

  // email validation
  var index = get_index_of(email)
  if (index > -1) {
    console.log('1. Email OK')
  } else {
    console.log('1. Email X')
    errors.push('Cette adresse mail est introuvable')
  }

  //state validation
  if (users[index].state == 1) {
    console.log('2. State X')
    errors.push('Vous êtes déjà connecté ailleurs')
  } else {
    console.log('2. State OK')
  }
  // password validation
  if (users[index].password != password) {
    console.log('3. Password X')
    errors.push('Le mot de passe entré est incorrect')
  } else {
    console.log('3. Password OK')
  }

  if (errors.length == 0) {
    console.log(' => Authentication OK')
    isAdmin = users[index].isAdmin
    username = users[index].username
    gender = users[index].gender
    users[index].state = 1
    res.send({
      errors: errors,
      username: username,
      isAdmin: isAdmin,
      gender: gender
    })
  } else {
    console.log(' => Authhentication X')
    res.send({
      errors: errors
    })
  }

})




router.post('/register.html', function (req, res) {

  var errors = []
  var temp_user = req.body
  console.log('********** Tentative d\'inscription : ', temp_user)

  var index = get_index_of(temp_user.email)

  if (index > -1) {
    errors.push('Cette adresse mail est déjà utilisée')
    console.log('1. Email X')
  } else {
    console.log('1. Email OK')

  }

  if (temp_user.password != temp_user.conf_password) {
    console.log('2. Password X')

    errors.push('La confirmation du mot de passe est incorrect')
  } else {
    console.log('2. Password OK')
  }
  if (errors.length == 0) {
    console.log(' => Inscription réussie')
    users.push({
      isAdmin: false,
      username: temp_user.username,
      gender: temp_user.gender,
      email: temp_user.email,
      password: temp_user.password,
      state: 1,
      panier: []
    })
    res.send('OK')
  } else {
    console.log(' => L\'inscription a échoué')
    res.send(errors)
  }
})

router.post('/delete.html', function (req, res) {
  var user = req.body
  console.log('********** Tentative de suppresion du compte : ', user)

  var index = get_index_of(user.email)

  if (index > -1) {
    delete users[index]
    console.log(' => Suppression réussie')
    res.send('OK')
  } else {
    console.log(' => Failed : Email inconnu')
    res.send('unknown_user')
  }
})


router.post('/update_panier.html', function (req, res) {
  user = users[get_index_of(req.body.user)]
  var new_panier = req.body.new_panier

  console.log(' ************ Mise à jour du panier de : ', req.body.user)
  console.log(' => Panier actuel : ', user.panier)

  user.panier = new_panier

  console.log(' => Nouveau panier : ', new_panier)

  res.send('OK')
})


router.get('/get_panier.html', function (req, res) {
  console.log(req.query.user)
  var user = users[get_index_of(req.query.user)]
  console.log('******* Récupération du panier de : ', user)
  console.log('        Panier : ', user.panier)
  res.send(user.panier)
})




router.post('/update_info_user.html', function (req, res) {

  var index = get_index_of(req.body.user)
  var email = req.body.email
  console.log('********* Tentative de mise à jour des informations de l\'utilisateur : ', users[index])

  var temp_index = -2
  if (email != '') {
    temp_index = get_index_of(email)
  }
  var errors = []

  // check email is valid
  if (temp_index > -1) { // OK ! email n'existe pas
    console.log('1. Email X')
    errors.push('Cette adresse mail existe déjà')
  } else {
    console.log('1. Email OK')
  }

  if (req.body.checkPassword) {
    console.log('*** Change password option : ')

    // check correspondance du nouveaux password
    if (req.body.new_password != req.body.conf_password) {
      console.log('2. Current password validation X')
      errors.push('La confirmation du nouveau mot de passe est incorrect')
    } else {
      console.log('2. Current password validation OK')
    }
    // check current password
    if (users[index].password != req.body.password) {
      console.log('3. New password validation X')
      errors.push('Le mot de passe entré est incorrect')
    } else {
      console.log('3. New password validation OK')
    }
  }

  if (errors.length > 0) {
    console.log(' => Update failed')
    res.send(errors)
  } else {
    console.log(' => Update succeeded')

    if (temp_index == -1) {
      users[index].email = email
    }
    users[index].username = req.body.username

    if (req.body.checkPassword) {
      users[index].password = req.body.new_password
    }

    res.send('OK')
  }
})














router.post('/users.html', function (req, res) {
  console.log(' ******* USERS LIST SENT TO AN ADMIN *********')
  res.send(users)
})



router.get('/best_grade.html', function (req, res) {
  console.log(' ******* BEST_GRADED_DATA LIST SENT ********')
  var best_tab = []
  data.forEach(function (cat) {
    best_tab.push(cat.elements[max(cat.elements)])
  })
  console.log('List : ', )
  res.send(best_tab)

})


function max(tab) {
  var max_index = 0;
  for (let i = 0; i < tab.length; i++) {
    if (tab[i].note > tab[max_index].note) {
      max_index = i
    }
  }

  return max_index;
}


router.get('/get_data.html', function (req, res) {
  console.log('********** DATA SENT TO CLIENT *********')

  var temp_data = []
  data.forEach(function (cat) {
    var cat_elements = cat.elements
    cat_elements.forEach(function (el) {
      var temp_el = el
      temp_el.categorie = cat.categorie
      temp_data.push(temp_el)
    })
  })

  res.send(temp_data)

})



router.get('/get_attr.html', function (req, res) {
  console.log('********** ATTRIBUTES SENT TO CLIENT *********')
  res.send({
    dataAttributes: Object.keys((data[0].elements)[0]),
    categories: ['Photographe', 'Traiteur', 'DJ', 'Decorateur', 'Transports', 'Soins', 'Gateaux'],
    usersAttributes: Object.keys(users[0])
  })



})

/* DATA */
var data = [{
    categorie: 'Photographe',
    elements: [{
        nom: 'Carole',
        text: `Photographe professionnelle, tout près de Paris, je vous accompagne pour toutes vos grandes occasions :  mariage, engagement, grossesse, nouveau-né, EVJF... mais aussi pour capturer votre quotidien en famille, avec bébé, ou entre amis.
      J’aime figer les moments d’intimité, les éclats de rires, les larmes, et transformer ces émotions en jolis souvenirs, si précieux avec le temps.`,
        prix: 900,
        note: 4,
        img: '/images/photographe1.jpg',
        source: 'https://www.carolejphotographie.com'
      },
      {

        nom: 'Sebastien',
        text: `En studio ou en extérieur, seul, à plusieurs, une mise ne valeur de votre personne, en apportant ma touche personnelle et mon oeil de photographe. `,
        prix: 1500,
        note: 4,
        img: '/images/photographe2.jpg',
        source: 'https://www.sebastienballet.com'

      },
      {

        nom: 'Photographe mariage',
        text: 'approche sensible - des photos à votre Image.',
        prix: 1000,
        note: 5,
        img: '/images/photographe3.jpg',
        source: 'https://www.photographe-mariage.fr'

      }
    ]
  },

  /* traiteurs : 1*/
  {
    categorie: 'Traiteur',
    elements: [{
        nom: 'Room Saveur',
        text: `Chez Room Saveurs, nous pensons comme vous et nous pensons à vous !
    Nous sommes animés par l’idée que ces petits moments peuvent rimer avec bien être, gourmandise et praticité… et nous faisons tout pour !`,
        prix: 1100,
        note: 3,
        img: '/images/traiteur1.jpg',
        source: 'https://www.roomsaveurs.fr/traiteur.html'
      },
      {

        nom: '1001 traiteurs',
        text: 'Décrivez vos besoins, nous vous ...',
        prix: 1500,
        note: 4,
        img: '/images/traiteur2.jpg',
        source: 'https://www.1001traiteurs.com/'
      },
      {

        nom: 'flunchTraiteur',
        text: 'flunchTraiteur, complice de vos événements',
        prix: 2000,
        note: 5,
        img: '/images/traiteur3.jpg',
        source: 'https://www.flunch-traiteur.fr/'

      }
    ]
  },

  /* dj : 2 */
  {
    categorie: 'DJ',
    elements: [{
        nom: 'dams-event',
        text: `Notre société vous propose différentes prestations DJ Haut de gamme pour l'animation de vos événements privés, Mariage, Entreprise, Anniversaire, soirée Rallye, etc.`,
        prix: 500,
        note: 3,
        img: '/images/dj1.jpg',
        source: 'http://dams-event.fr/mobile'
      },
      {

        nom: 'Direct DJ',
        text: `Direct DJ est une entreprise "familiale" fondée en 1979 spécialisée dans l'animation et l'organisation de mariages`,
        prix: 800,
        note: 4,
        img: '/images/dj2.jpg',
        source: 'https://www.zankyou.fr/f/direct-dj-432082'
      },
      {

        nom: 'Randy DJ',
        text: `Rythme et festivité reste sans conteste le duo gagnant pour une soirée de mariage inoubliable et unique. Alors faites confiance à un professionnel de la nuit et du son, Randy DJ, spécialiste des fêtes de mariages africains, mixtes et culture généraliste à Paris et dans toute la France.`,
        prix: 1000,
        note: 5,
        img: '/images/dj3.jpg',
        source: 'https://www.zankyou.fr/f/randy-dj-music-and-lights-405935'

      }
    ]
  },

  /* decorateurs : 3 */
  {
    categorie: 'Decorateur',
    elements: [{
        nom: 'Mon Décorateur',
        text: `Vous cherchez une décoration de mariage unique et originale ? Ou vous organisez un salon et avez besoin de vous faire accompagner dans l‘aménagement de vos stands ? Pas de panique, le décorateur événementiel est là pour vous aider ! Mais qu’est-ce que la décoration événementielle ? Et quelles sont les prestations proposées ? Le point avec Lebondécorateur.fr La décoration événementielle, c’est avant tout l’art de l’éphémère.`,
        prix: 3000,
        note: 4,
        img: '/images/décorateur1.jpg',
        source: 'https://mondecorateur.pro/decorer-votre-evenement/'
      },
      {

        nom: 'Sublime Day Event',
        text: `Sublime Day Events est une agence de décoration événementielle, labellisée et certifiée Wedding Designer. L’agence est spécialisée dans la conception et création de mariages et d’événements originaux, élégants et sur mesure. Nous concevons des décors uniques et transformons vos espaces pour tous types d’événements, privés ou professionnels.`,
        prix: 3500,
        note: 4,
        img: '/images/décorateur2.jpg',
        source: 'http://www.sublimedayevents.fr/decoratrice-mariage-et-evenement-ile-de-france-78/'
      },
      {

        nom: 'Prest\'agency',
        text: `Lorsque vous prévoyez d'organiser une soirée thématique, on oublie souvent que le décor va participer grandement à l'ambiance de la soirée et ce afin que vos convives s'approprient les lieux et rentrent immédiatement dans l'esprit que vous voulez donner à votre soirée. La réalisation d'un décor est aussi l'occasion de permettre aux participants de s'évader complètement en plongeant dans l'univers du voyage et du rêve.`,
        prix: 5000,
        note: 5,
        img: '/images/décorateur3.jpg',
        source: 'https://www.prestagency.com/decoration-evenementielle-paris.php'

      }
    ]
  },


  /* transports : 4*/
  {
    categorie: 'Transports',
    elements: [{
        nom: 'Location Retro Mariage ',
        text: `Une cérémonie, un anniversaire, votre propre mariage   sont des moments si importants de votre vie, des heures pleines d'émotions, des instants si magiques. Sublimez ces événements, étonnez vos invités, offrez vous le carrosse en rapport avec vos envies...`,
        prix: 400,
        note: 3,
        img: '/images/voiture1.jpg',
        source: 'https://www.lrm-collection.fr/Location-voiture-mariage-dans-votre-departement.htm'
      },
      {

        nom: 'Europcar',
        text: `Parce que nous savons à quel point ce jour compte, Europcar met spécialement en place la location de voiture pour vos grandes occasions. Parmi notre sélection, choisissez la voiture de luxe que vous souhaitez pour votre mariage.`,
        prix: 500,
        note: 2,
        img: '/images/voiture2.jpg',
        source: 'https://www.europcar.fr/agences/location-voiture-mariage'
      },
      {
        nom: 'Sixt',
        text: `Vous avez enfin trouvé la femme ou l'homme de votre vie et la date du mariage se rapproche ? Quoi de plus normal, pour ce jour mémorable, de vouloir que tout soit parfait, de la cérémonie à la fête en passant par la location de voiture de votre mariage.`,
        prix: 800,
        note: 3,
        img: '/images/voiture3.jpg',
        source: 'https://www.sixt.fr/location-voiture-mariage/'

      }
    ]
  },



  /*soins:5*/
  {
    categorie: 'Soins',
    elements: [{
        nom: 'Citron Vert',
        text: 'Partout en France, les instituts de beauté Citron Vert vous accueillent, au gré de vos envies, pour une pause beauté synonyme de détente et de plaisir dans un cadre chaleureux.',
        prix: 200,
        note: 3,
        img: '/images/soin1.jpg',
        source: 'http://www.citron-vert.fr/'
      },
      {
        nom: 'Planity',
        text: 'Comme son nom l\'indique, l\'institut de beauté est l\endroit idéal pour recevoir diféérents types de soins : soin du visage, soin corporel, beauté des pieds et beauté des mains ou encore l\'épilation.',
        prix: 300,
        note: 3,
        img: '/images/soin2.jpg',
        source: 'https://www.planity.com/institut-de-beaute'
      },
      {
        nom: 'DS Beauté',
        text: `Constitué d'une petite équipe de professionnelles diplômées, l'institut de beauté DS Beauté vous ouvre ses portes et vous propose un service exceptionnel dans un cadre chaleureux.
      L'institut de beauté DS Beauté ce sont des soins du corps et du visage à la carte ou en forfait : massages, soins amincissants, épilation, manucure... Toutes nos prestations sont modulables en fonction de vos demandes.`,
        prix: 400,
        note: 4,
        img: '/images/soin3.jpg',
        source: 'http://www.dsbeaute.fr/'

      }
    ]
  },

  /*gateaux : 6*/
  {
    categorie: 'Gateaux',
    elements: [{
        nom: 'Votre Gâteau',
        text: 'Faites confiance au n°1 du gâteau personnalisé et commandez directement en ligne ! Faites-nous part de vos souhaits et nous imprimons pour vous vos propres gâteaux photos, gâteaux à thèmes, gâteaux d’anniversaire, gâteaux d’anniversaire pour enfants ou pâte d’amande avec photo !',
        prix: 250,
        note: 4,
        img: '/images/gâteau1.jpg',
        source: 'https://www.votregateau.fr/'
      },
      {
        nom: 'Mon Gâteau FANTASTIC',
        text: 'Commandez des gâteaux d\'anniversaire personnalisés même si vous êtes de très très grands enfants! Livraison de votre gâteau d\'anniversaire sur toute la France! ',
        prix: 200,
        note: 4,
        img: '/images/gâteau2.jpg',
        source: 'http://www.mon-gateau-fantastic.fr/'
      },
      {
        nom: 'GateauCreateur',
        text: 'Plus de 20 départements desservis par GateauCreateur. Commande et personnalisation 100% en ligne ou par téléphone.',
        prix: 350,
        note: 4,
        img: '/images/gâteau3.jpg',
        source: 'https://gateaucreateur.fr'

      }
    ]
  }

]


module.exports = router;