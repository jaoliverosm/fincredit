let _navigate = null;

export function setGlobalNavigate(fn) {
  _navigate = fn;
}

export function globalNavigate(path, options) {
  if (_navigate) _navigate(path, options);
}
