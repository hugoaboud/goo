import '../goo/components/goo-style.goo'
import '../goo/components/goo-app.goo'
import '../goo/components/goo-page-error.goo'
import '../goo/components/goo-card.goo'
import '../goo/components/goo-btn.goo'
import '../goo/components/goo-list.goo'
import '../goo/components/goo-modal.goo'
import '../goo/components/goo-form.goo'
import '../goo/components/goo-chart.goo'

import './my-app.goo'
import './pages/page-welcome.goo'
import './pages/page-buttons.goo'
import './pages/page-lists.goo'
import './pages/page-modals.goo'
import './pages/page-forms.goo'

import '../quimblos/qb-page-sandbox.goo'
import '../quimblos/qb-hex.goo'
import '../quimblos/qb-led-bar.goo'
import '../quimblos/qb-servo.goo'
import '../quimblos/qb-water-tank.goo'

import Goo from '@quimblos/goo';
import { GooRouter } from '@quimblos/goo/src/router'

function setup() {
  const routes = GooRouter.tree('my-app', $ => $
    .alias('Home')
    .menu($ => [$('Home')])
    .child('welcome', $ => $
      .slot('my-app|page', 'page-welcome')
    )
    .child('buttons', $ => $
      .alias('Buttons')
      .menu($ => [$('Buttons')])
      .slot('my-app|page', 'page-buttons')
    )
    .child('lists', $ => $
      .alias('Lists')
      .menu($ => [$('Lists')])
      .slot('my-app|page', 'page-lists')
    )
    .child('modals', $ => $
      .alias('Modals')
      .menu($ => [$('Modals')])
      .slot('my-app|page', 'page-modals')
      .child('modal', $ => $
        .slot('page|modal', 'goo-modal', {
          props: { is_open: true },
          innerHTML: '<a>You can close this modal by going back in browser history.</a>'
        })
      )
    )
    .child('forms', $ => $
      .alias('Forms')
      .menu($ => [$('Forms')])
      .slot('my-app|page', 'page-forms')
    )
    .child('quimblos', $ => $
      .alias('Quimblos')
      .menu($ => [$('Quimblos')])
      .slot('my-app|page', 'qb-page-sandbox')
    )
    .follow_to('welcome')
  )

  Goo.init([
    'goo-style',
    'my-app'
  ], routes);
}

setup();