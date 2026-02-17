import '../goo/components/goo-style.goo'
import '../goo/components/goo-app-menu.goo'
import '../goo/components/goo-card.goo'
import '../goo/components/goo-btn.goo'
import '../goo/components/goo-list.goo'
import './components/my-app.goo'
// import './components/my-btn.goo'

function setup() {  
  const gooStyle = document.createElement('goo-style');
  document.body.appendChild(gooStyle);
  
  const app = document.createElement('my-app');
  document.body.appendChild(app);
}

setup();