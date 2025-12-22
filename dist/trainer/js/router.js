export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.params = {};
    
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, ...paramParts] = hash.split('/');
    
    // Match static routes
    if (this.routes[hash]) {
      this.currentRoute = hash;
      this.params = {};
      this.routes[hash]();
      return;
    }

    // Match dynamic routes
    for (const [route, handler] of Object.entries(this.routes)) {
      const routeParts = route.split('/');
      const hashParts = hash.split('/');

      if (routeParts.length !== hashParts.length) continue;

      let isMatch = true;
      const params = {};

      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          const paramName = routeParts[i].slice(1);
          params[paramName] = hashParts[i];
        } else if (routeParts[i] !== hashParts[i]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        this.currentRoute = route;
        this.params = params;
        handler(params);
        return;
      }
    }

    // 404 - redirect to home
    this.navigate('/');
  }

  getParam(name) {
    return this.params[name];
  }
}