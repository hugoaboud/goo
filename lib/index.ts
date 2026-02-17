function getGlobalStyleSheets() {
  return Array.from(document.styleSheets)
    .map(x => {
      const sheet = new CSSStyleSheet();
      const css = Array.from(x.cssRules).map(rule => rule.cssText).join(' ');
      sheet.replaceSync(css);
      return sheet;
    });
}

export function addGlobalStyle(shadowRoot: ShadowRoot) {
  shadowRoot.adoptedStyleSheets.push(
    ...getGlobalStyleSheets()
  );
}