import '../goo/components/goo-style.goo'
import '../goo/components/goo-app.goo'
import '../goo/components/goo-page-error.goo'
import '../goo/components/goo-card.goo'
import '../goo/components/goo-btn.goo'
import '../goo/components/goo-list.goo'
import '../goo/components/goo-modal.goo'
import '../goo/components/goo-form.goo'
import './components/my-app.goo'
import './pages/page-welcome.goo'

//  import './components/debug-app.goo'
//  import './components/debug-slot.goo'


import Goo from '@quimblos/goo';
import { GooRouter } from '@quimblos/goo/src/router'

function setup() {
  const routes = GooRouter.tree('my-app', $ => $
    .alias('Home')
    .menu($ => [$('Home')])
    .child('welcome', $ => $
      .slot('my-app|page', 'page-welcome')
    )
    .follow_to('welcome')
  )

  Goo.init([
    'goo-style',
    'my-app'
  ], routes);
}

setup();