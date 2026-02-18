import '../goo/components/goo-style.goo'
import '../goo/components/goo-app-menu.goo'
import '../goo/components/goo-card.goo'
import '../goo/components/goo-btn.goo'
import '../goo/components/goo-list.goo'
import '../goo/components/goo-modal.goo'
import './components/my-app.goo'

import Goo from '@goo/lib';

function setup() {
  Goo.init([
    'goo-style',
    'my-app'
  ])
}

setup();